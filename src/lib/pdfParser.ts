/**
 * @fileoverview PDF Bank Statement Parser Utility
 * 
 * This module provides functionality to parse PDF bank statements from various
 * Indian banks and extract transaction data. It uses react-pdftotext for client-side
 * processing to ensure data privacy and security.
 * 
 * COMPLETELY REWRITTEN: Now uses react-pdftotext instead of pdfjs-dist
 * 
 * Supported formats:
 * - HDFC Bank statements
 * - ICICI Bank statements  
 * - SBI statements
 * - Axis Bank statements
 * - Generic tabular statements
 * 
 * @author GitHub Copilot
 * @version 2.0.0
 */

import pdfToText from 'react-pdftotext';
import { ParsedTransaction, ImportError } from '../types/financial';

/**
 * Interface for PDF parsing configuration
 */
interface PDFParseConfig {
  /** Maximum pages to process (prevents large files from hanging) */
  maxPages?: number;
  /** Minimum confidence threshold for extracted data */
  confidenceThreshold?: number;
  /** Bank-specific parsing rules */
  bankType?: 'hdfc' | 'icici' | 'sbi' | 'axis' | 'generic';
}

/**
 * Interface for bank parsing patterns
 */
interface BankPattern {
  datePattern: RegExp;
  amountPattern: RegExp;
  descriptionPattern: RegExp;
  balanceKeywords: string[];
}

/**
 * Common patterns for Indian bank statement parsing
 */
const BANK_PATTERNS: Record<string, BankPattern> = {
  hdfc: {
    datePattern: /(\d{2}\/\d{2}\/\d{4})/g,
    amountPattern: /([+-]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    descriptionPattern: /([A-Z0-9/-\s]+)/g,
    balanceKeywords: ['balance', 'bal'],
  },
  icici: {
    datePattern: /(\d{2}-\d{2}-\d{4})/g,
    amountPattern: /([+-]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    descriptionPattern: /([A-Z0-9/-\s]+)/g,
    balanceKeywords: ['balance', 'bal'],
  },
  sbi: {
    datePattern: /(\d{2}-\d{2}-\d{4})/g,
    amountPattern: /([+-]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    descriptionPattern: /([A-Z0-9/-\s]+)/g,
    balanceKeywords: ['balance', 'bal'],
  },
  axis: {
    datePattern: /(\d{2}\/\d{2}\/\d{4})/g,
    amountPattern: /([+-]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    descriptionPattern: /([A-Z0-9/-\s]+)/g,
    balanceKeywords: ['balance', 'bal'],
  },
  generic: {
    datePattern: /(\d{1,2}[/-]\d{1,2}[/-]\d{4})/g,
    amountPattern: /([+-]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    descriptionPattern: /([A-Z0-9/-\s]+)/g,
    balanceKeywords: ['balance', 'bal', 'amount'],
  },
};

/**
 * Parse PDF bank statement and extract transaction data using react-pdftotext
 * 
 * @param file - PDF file to parse
 * @param config - Parsing configuration options
 * @returns Promise resolving to parsed transactions and any errors
 */
export async function parsePDFBankStatement(
  file: File,
  config: PDFParseConfig = {}
): Promise<{ transactions: ParsedTransaction[]; errors: ImportError[] }> {
  const {
    maxPages = 10,
    confidenceThreshold = 0.7,
    bankType = 'generic'
  } = config;

  const errors: ImportError[] = [];
  const transactions: ParsedTransaction[] = [];

  try {
    // Validate file
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid PDF file provided');
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('PDF file too large (max 50MB)');
    }

    console.log('📄 Starting PDF text extraction...');

    // Extract text from PDF using react-pdftotext
    const text = await pdfToText(file);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF. The file might be scanned or corrupted.');
    }

    console.log('� Text extracted successfully, length:', text.length);
    // --- BEGIN DEBUG LOGGING: Print the full extracted text for troubleshooting SBI pattern mismatches ---
    console.log('--- START OF EXTRACTED TEXT ---');
    console.log(text);
    console.log('--- END OF EXTRACTED TEXT ---');

    // Detect bank type from text if not specified
    const detectedBankType = bankType === 'generic' ? detectBankType(text) : bankType;
    console.log('🏦 Detected bank type:', detectedBankType);

    // Parse transactions from extracted text
    const parsedTransactions = await parseTransactionsFromText(text, detectedBankType);
    transactions.push(...parsedTransactions.transactions);
    errors.push(...parsedTransactions.errors);

    // Validate results
    if (transactions.length === 0) {
      errors.push({
        message: 'No transactions found in PDF. This might not be a bank statement or the format is not supported.',
        severity: 'error'
      });
    }

    console.log(`✅ PDF parsing complete: ${transactions.length} transactions, ${errors.length} errors`);

    return { transactions, errors };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown PDF parsing error';
    console.error('❌ PDF parsing failed:', errorMessage);
    
    errors.push({
      message: `PDF parsing failed: ${errorMessage}`,
      severity: 'error'
    });

    return { transactions: [], errors };
  }
}

/**
 * Parse transactions from extracted PDF text
 */
async function parseTransactionsFromText(
  text: string,
  bankType: keyof typeof BANK_PATTERNS
): Promise<{ transactions: ParsedTransaction[]; errors: ImportError[] }> {
  const transactions: ParsedTransaction[] = [];
  const errors: ImportError[] = [];
  const patterns = BANK_PATTERNS[bankType];

  try {
    // Split text into lines
    const allLines = text.split('\n').filter(line => line.trim().length > 0);

    // Try different parsing strategies
    const strategies = [
      () => parseTabularFormat(allLines, patterns),
      () => parseLineByLineFormat(allLines, patterns),
      () => parseRegexFormat(text, patterns)
    ];

    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result.length > 0) {
          transactions.push(...result);
          break; // Use first successful strategy
        }
      } catch (strategyError) {
        console.warn('Parsing strategy failed:', strategyError);
      }
    }

    // Clean and validate transactions
    const validTransactions = transactions
      .filter(tx => tx.date && tx.amount !== 0)
      .map((tx, index) => ({
        ...tx,
        id: `pdf-${Date.now()}-${index}`
      }));

    console.log(`🔍 Parsed ${validTransactions.length} valid transactions using ${bankType} patterns`);

    return { 
      transactions: validTransactions, 
      errors: validTransactions.length === 0 ? [{
        message: 'No valid transactions could be extracted from the PDF text',
        severity: 'warning'
      }] : []
    };

  } catch (error) {
    errors.push({
      message: `Text parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error'
    });

    return { transactions: [], errors };
  }
}

/**
 * Parse tabular format (most common in bank PDFs)
 */
function parseTabularFormat(lines: string[], patterns: BankPattern): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // Enhanced header detection for various bank formats
  const headerPatterns = [
    /date.*description.*amount/i,
    /date.*narration.*amount/i,
    /date.*particulars.*amount/i,
    /date.*details.*amount/i,
    /transaction.*date.*amount/i
  ];
  
  let headerLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (headerPatterns.some(pattern => pattern.test(line))) {
      headerLine = i;
      break;
    }
  }

  if (headerLine === -1) {
    // Try to find any line with date and amount patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dateMatch = line.match(patterns.datePattern);
      const amountMatch = line.match(patterns.amountPattern);
      if (dateMatch && amountMatch) {
        headerLine = i - 1; // Assume previous line might be header
        break;
      }
    }
  }

  // Parse rows after header or from beginning if no header found
  const startIndex = headerLine === -1 ? 0 : headerLine + 1;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 10) continue; // Skip very short lines

    const dateMatch = line.match(patterns.datePattern);
    const amountMatches = line.match(patterns.amountPattern);
    
    if (dateMatch && amountMatches && amountMatches.length > 0) {
      const date = standardizeDate(dateMatch[0]);
      const amounts = amountMatches.map(a => parseFloat(a.replace(/,/g, '')));
      
      // Find the most likely transaction amount (usually the last amount in the line)
      const amount = amounts[amounts.length - 1] || amounts[0] || 0;
      
      // Determine if debit or credit based on amount and context
      let type: 'credit' | 'debit' = 'credit';
      if (amount < 0) {
        type = 'debit';
      } else if (line.toLowerCase().includes('dr') || line.toLowerCase().includes('debit')) {
        type = 'debit';
      } else if (line.toLowerCase().includes('cr') || line.toLowerCase().includes('credit')) {
        type = 'credit';
      }
      
      // Extract description (everything between date and amount)
      const parts = line.split(/\s+/);
      const dateIndex = parts.findIndex(part => patterns.datePattern.test(part));
      const amountIndex = parts.findIndex(part => patterns.amountPattern.test(part));
      
      let description = 'Transaction';
      if (dateIndex !== -1 && amountIndex !== -1 && amountIndex > dateIndex + 1) {
        description = parts.slice(dateIndex + 1, amountIndex).join(' ').trim();
      } else if (dateIndex !== -1) {
        // If no amount index found, take everything after date
        description = parts.slice(dateIndex + 1).join(' ').trim();
      }

      // Clean up description
      description = description.replace(patterns.amountPattern, '').trim();
      if (description.length > 100) {
        description = description.substring(0, 100) + '...';
      }

      if (description && amount !== 0) {
        transactions.push({
          id: `temp-${transactions.length}`,
          date,
          description: description || 'Transaction',
          amount: Math.abs(amount),
          type,
          category: categorizeTransaction(description),
          isReconciled: false,
          confidence: 0.8
        });
      }
    }
  }

  return transactions;
}

/**
 * Parse line-by-line format
 */
function parseLineByLineFormat(lines: string[], patterns: BankPattern): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  for (let i = 0; i < lines.length - 2; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1]?.trim() || '';
    const thirdLine = lines[i + 2]?.trim() || '';
    
    const combinedLine = `${currentLine} ${nextLine} ${thirdLine}`;
    
    const dateMatch = combinedLine.match(patterns.datePattern);
    const amountMatch = combinedLine.match(patterns.amountPattern);
    
    if (dateMatch && amountMatch) {
      const date = standardizeDate(dateMatch[0]);
      const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
      
      transactions.push({
        id: `temp-${transactions.length}`,
        date,
        description: currentLine.replace(patterns.datePattern, '').replace(patterns.amountPattern, '').trim() || 'Transaction',
        amount: Math.abs(amount),
        type: amount < 0 ? 'debit' : 'credit',
        category: 'other',
        isReconciled: false,
        confidence: 0.7
      });
    }
  }

  return transactions;
}

/**
 * Parse using regex patterns (fallback method)
 */
function parseRegexFormat(text: string, patterns: BankPattern): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const dateMatch = line.match(patterns.datePattern);
    const amountMatches = line.match(patterns.amountPattern);
    
    if (dateMatch && amountMatches && amountMatches.length > 0) {
      const date = standardizeDate(dateMatch[0]);
      const amounts = amountMatches.map(a => parseFloat(a.replace(/,/g, '')));
      const amount = amounts[amounts.length - 1] || amounts[0] || 0;
      
      // Determine transaction type
      let type: 'credit' | 'debit' = 'credit';
      if (amount < 0) {
        type = 'debit';
      } else if (line.toLowerCase().includes('dr') || line.toLowerCase().includes('debit')) {
        type = 'debit';
      } else if (line.toLowerCase().includes('cr') || line.toLowerCase().includes('credit')) {
        type = 'credit';
      }
      
      // Extract description
      let description = line.replace(patterns.datePattern, '').replace(patterns.amountPattern, '').trim();
      description = description.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (description && amount !== 0) {
        transactions.push({
          id: `temp-${transactions.length}`,
          date,
          description: description || 'Transaction',
          amount: Math.abs(amount),
          type,
          category: categorizeTransaction(description),
          isReconciled: false,
          confidence: 0.6
        });
      }
    }
  }

  return transactions;
}

/**
 * Standardize date format to YYYY-MM-DD
 */
function standardizeDate(dateStr: string): string {
  try {
    // Handle different date formats
    const cleaned = dateStr.replace(/[^\d/-]/g, '');
    const parts = cleaned.split(/[/-]/);
    
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return new Date().toISOString().split('T')[0]; // Fallback to today
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Categorize transaction based on description
 */
function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  // Income categories
  if (desc.includes('salary') || desc.includes('credit') || desc.includes('deposit')) return 'income';
  if (desc.includes('interest') || desc.includes('dividend')) return 'income';
  if (desc.includes('refund') || desc.includes('cashback')) return 'income';
  
  // Food categories
  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food')) return 'food';
  if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('dining')) return 'food';
  if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('delivery')) return 'food';
  
  // Transport categories
  if (desc.includes('fuel') || desc.includes('petrol') || desc.includes('diesel')) return 'transport';
  if (desc.includes('uber') || desc.includes('ola') || desc.includes('taxi')) return 'transport';
  if (desc.includes('metro') || desc.includes('bus') || desc.includes('train')) return 'transport';
  if (desc.includes('parking') || desc.includes('toll')) return 'transport';
  
  // Shopping categories
  if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra')) return 'shopping';
  if (desc.includes('mall') || desc.includes('store') || desc.includes('shop')) return 'shopping';
  if (desc.includes('clothing') || desc.includes('fashion')) return 'shopping';
  
  // Utilities categories
  if (desc.includes('electricity') || desc.includes('power')) return 'utilities';
  if (desc.includes('water') || desc.includes('gas')) return 'utilities';
  if (desc.includes('internet') || desc.includes('wifi') || desc.includes('broadband')) return 'utilities';
  if (desc.includes('mobile') || desc.includes('phone') || desc.includes('recharge')) return 'utilities';
  
  // Entertainment categories
  if (desc.includes('netflix') || desc.includes('prime') || desc.includes('hotstar')) return 'entertainment';
  if (desc.includes('movie') || desc.includes('cinema') || desc.includes('theatre')) return 'entertainment';
  if (desc.includes('game') || desc.includes('gaming')) return 'entertainment';
  
  // Cash categories
  if (desc.includes('atm') || desc.includes('cash')) return 'cash';
  
  // Transfer categories
  if (desc.includes('transfer') || desc.includes('neft') || desc.includes('imps')) return 'transfer';
  
  // Payment categories
  if (desc.includes('payment') || desc.includes('bill')) return 'payment';
  if (desc.includes('rent') || desc.includes('emi')) return 'payment';
  
  // Healthcare categories
  if (desc.includes('medical') || desc.includes('hospital') || desc.includes('pharmacy')) return 'healthcare';
  if (desc.includes('doctor') || desc.includes('clinic')) return 'healthcare';
  
  return 'other';
}

/**
 * Detect bank type from PDF text
 */
export function detectBankType(text: string): keyof typeof BANK_PATTERNS {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('hdfc')) return 'hdfc';
  if (lowerText.includes('icici')) return 'icici';
  if (lowerText.includes('state bank') || lowerText.includes('sbi')) return 'sbi';
  if (lowerText.includes('axis')) return 'axis';
  
  return 'generic';
}
