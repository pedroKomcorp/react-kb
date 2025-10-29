import React from 'react';
import type { Credito } from '../../types/credito';

interface CreditoSummaryProps {
  creditos: Credito[];
  isFiltered: boolean;
  totalCreditos: number;
  filterName?: string;
}

const CreditoSummary: React.FC<CreditoSummaryProps> = ({
  creditos,
  isFiltered,
  totalCreditos,
  filterName
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value).replace('R$', 'R$').replace(/\s/, '');
  };

  const totalInicial = creditos.reduce((sum, c) => sum + c.valor_original, 0);
  const totalAtual = creditos.reduce((sum, c) => sum + c.saldo_atual, 0);
  const diferenca = creditos.reduce((sum, c) => sum + (c.saldo_atual - c.valor_original), 0);

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6">
      <h5 className="font-medium text-gray-900 mb-4">
        Resumo {isFiltered ? 'Filtrado' : 'Total'}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalInicial)}
          </div>
          <div className="text-sm text-gray-600">Total Inicial</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalAtual)}
          </div>
          <div className="text-sm text-gray-600">Total Atual</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            diferenca >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(diferenca)}
          </div>
          <div className="text-sm text-gray-600">Diferença Total</div>
        </div>
      </div>
      {isFiltered && filterName && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            * Resumo baseado nos {creditos.length} créditos filtrados de {totalCreditos} total
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditoSummary;