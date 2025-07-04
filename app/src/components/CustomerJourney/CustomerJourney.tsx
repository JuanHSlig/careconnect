import React from 'react';
import { useClient } from '../../contexts/ClientContext';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const STAGES = ['Desconocido', 'Prospecto', 'Cliente', 'Facturado'];

const CustomerJourney: React.FC = () => {
  const { selectedClient } = useClient();

  if (!selectedClient) {
    return <div className="p-4 text-center text-gray-500">Selecciona un cliente para ver su viaje.</div>;
  }
  
  const currentStageIndex = STAGES.indexOf(selectedClient.stage);

  return (
    <div className="p-6 rounded-xl card main-bg">
      <h2 className="text-2xl font-bold mb-6 text-[var(--fg)]">Customer Journey: {selectedClient.name}</h2>
      
      <div className="flex items-center justify-between">
        {STAGES.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center text-center">
              <div
                className={clsx(
                  'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 transform',
                  {
                    'bg-green-500 shadow-lg scale-110': index < currentStageIndex,
                    'bg-blue-500 shadow-xl scale-125 ring-4 ring-blue-300 dark:ring-blue-600': index === currentStageIndex,
                    'bg-gray-300 dark:bg-gray-600': index > currentStageIndex,
                  }
                )}
              >
                {index + 1}
              </div>
              <p className={clsx('mt-2 font-semibold', { 'text-[var(--fg)]': index <= currentStageIndex, 'text-gray-400': index > currentStageIndex })}>
                {stage}
              </p>
            </div>

            {index < STAGES.length - 1 && (
                <div className={clsx("flex-1 h-1 mx-2", {
                    'bg-green-500': index < currentStageIndex,
                    'bg-gray-300 dark:bg-gray-600': index >= currentStageIndex,
                })} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CustomerJourney; 