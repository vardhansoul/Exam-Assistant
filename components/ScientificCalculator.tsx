import React, { useState } from 'react';
import Card from './Card';

const factorial = (n: number): number => {
    if (n < 0 || n !== Math.floor(n)) return NaN; // Factorial is only for non-negative integers
    if (n > 170) return Infinity; // Prevent overflow
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};

const evaluateExpression = (expr: string): string => {
    if (!expr) return '0';
    try {
        const sanitizedExpr = expr
            // Replace user-facing symbols with JS Math equivalents
            .replace(/√/g, 'Math.sqrt')
            .replace(/sin\(/g, 'Math.sin(Math.PI/180*')
            .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
            .replace(/tan\(/g, 'Math.tan(Math.PI/180*')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            // Handle factorial: find numbers (including decimals for error check) followed by '!'
            .replace(/(\d*\.?\d+)!/g, (match, n) => {
                const num = parseFloat(n);
                if (num !== Math.floor(num)) {
                    throw new Error("Factorial of non-integer");
                }
                return `factorial(${n})`;
            });
        
        // Final validation to prevent malicious code
        const validPattern = /^[0-9().+\-*/\s,Math.PIEsqrtcosintalog**factorial]+$/;
        if (!validPattern.test(sanitizedExpr)) {
            return "Error";
        }
        
        // Use the Function constructor for safer evaluation than eval()
        const result = new Function('factorial', `return ${sanitizedExpr}`)(factorial);
        
        if (typeof result !== 'number' || !isFinite(result)) {
            return "Error";
        }

        // Format to a reasonable number of decimal places
        return String(parseFloat(result.toPrecision(15)));

    } catch (error) {
        return "Error";
    }
};

const ScientificCalculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');

    const handleInput = (value: string) => {
        setDisplay('0');
        setExpression(prev => prev + value);
    };

    const clear = () => {
        setDisplay('0');
        setExpression('');
    };

    const backspace = () => {
        setExpression(prev => prev.slice(0, -1));
    };

    const calculate = () => {
        const result = evaluateExpression(expression);
        setDisplay(result);
        setExpression(result === 'Error' ? '' : result);
    };
    
    const CalcButton: React.FC<{
        value: string;
        onClick: (val: string) => void;
        className?: string;
        label?: string;
    }> = ({ value, onClick, className = '', label }) => (
      <button
        onClick={() => onClick(value)}
        className={`p-3 sm:p-4 rounded-lg text-lg sm:text-xl font-semibold transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-95 ${className}`}
        aria-label={label || value}
      >
        {value}
      </button>
    );

    const buttons = [
        { val: 'sin(', type: 'func' }, { val: 'cos(', type: 'func' }, { val: 'tan(', type: 'func' }, { val: 'log(', type: 'func' }, { val: 'ln(', type: 'func' },
        { val: '(', type: 'op' }, { val: ')', type: 'op' }, { val: '√(', type: 'func' }, { val: '^', type: 'op' }, { val: '!', type: 'op' },
        { val: '7', type: 'num' }, { val: '8', type: 'num' }, { val: '9', type: 'num' }, { val: 'DEL', type: 'clear' }, { val: 'AC', type: 'clear' },
        { val: '4', type: 'num' }, { val: '5', type: 'num' }, { val: '6', type: 'num' }, { val: '*', type: 'op' }, { val: '/', type: 'op' },
        { val: '1', type: 'num' }, { val: '2', type: 'num' }, { val: '3', type: 'num' }, { val: '+', type: 'op' }, { val: '-', type: 'op' },
        { val: '0', type: 'num' }, { val: '.', type: 'num' }, { val: 'π', type: 'num' }, { val: 'e', type: 'num' }, { val: '=', type: 'eq' },
    ];
    
    const getButtonStyles = (type: string) => {
        switch(type) {
            case 'num': return 'bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-500';
            case 'op': return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200';
            case 'func': return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-base';
            case 'clear': return 'bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300';
            case 'eq': return 'bg-indigo-600 hover:bg-indigo-700 text-white';
            default: return '';
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <div className="text-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Scientific Calculator</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Trigonometry functions are in degrees.</p>
                </div>
                {/* Display */}
                <div className="bg-slate-800 text-white text-right p-4 rounded-lg mb-4 shadow-inner">
                    <div className="text-slate-400 text-sm h-7 truncate" title={expression}>{expression || ' '}</div>
                    <div className="text-4xl font-bold h-12 truncate" title={display}>{display}</div>
                </div>
                {/* Buttons */}
                <div className="grid grid-cols-5 gap-2">
                    {buttons.map(({val, type}) => (
                         <CalcButton
                            key={val}
                            value={val}
                            className={getButtonStyles(type)}
                            onClick={(v) => {
                                if (v === 'AC') clear();
                                else if (v === 'DEL') backspace();
                                else if (v === '=') calculate();
                                else handleInput(v);
                            }}
                         />
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ScientificCalculator;