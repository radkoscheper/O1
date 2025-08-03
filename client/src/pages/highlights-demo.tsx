import React from 'react';
import { HighlightsDialogs, mockHighlights } from '@/components/ui/highlights-dialogs';

export function HighlightsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Highlights Dialogs Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Interactive highlight cards met gedetailleerde dialogs
          </p>
        </div>
        
        <div className="grid gap-12">
          {/* Full Highlights Section */}
          <section>
            <HighlightsDialogs
              highlights={mockHighlights}
              title="Ontdek de Beste Ervaringen in Polen"
              subtitle="Van historische kastelen tot adembenemende natuurgebieden - Polen heeft voor ieder wat wils"
              maxDisplay={3}
              showViewAll={true}
            />
          </section>

          {/* Compact Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <HighlightsDialogs
              highlights={mockHighlights.slice(0, 4)}
              title="Top Historische Highlights"
              subtitle="Duik in de rijke geschiedenis van Polen"
              maxDisplay={4}
              showViewAll={false}
            />
          </section>

          {/* Nature Only */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8">
            <HighlightsDialogs
              highlights={mockHighlights.filter(h => h.category === 'Natuur')}
              title="Natuurlijke Wonderen"
              subtitle="Ervaar de ongerepte natuur van Polen"
              maxDisplay={2}
              showViewAll={true}
            />
          </section>
        </div>
      </div>
    </div>
  );
}