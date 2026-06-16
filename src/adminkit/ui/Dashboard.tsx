'use client';
import React from 'react';

export interface DashboardWidget {
  id: string;
  title?: string;
  span?: 1 | 2 | 3 | 4;     // ширина в колонках (сетка из 4)
  action?: React.ReactNode; // правый верхний угол карточки
  node: React.ReactNode;
  flush?: boolean;          // убрать внутренние отступы (для таблиц)
}

/** Сетка виджетов главной. Что показывать — задаёшь массивом widgets (можно менять/добавлять). */
export function Dashboard({ widgets }: { widgets: DashboardWidget[] }) {
  return (
    <div className="dash-grid">
      {widgets.map((w, i) => (
        <section
          key={w.id}
          className="dash-card fade-up"
          style={{ gridColumn: `span ${w.span ?? 1}`, animationDelay: `${i * 70}ms` }}
        >
          {(w.title || w.action) && (
            <div className="dash-card-h">
              <span>{w.title}</span>{w.action}
            </div>
          )}
          <div className={w.flush ? '' : 'dash-card-b'}>{w.node}</div>
        </section>
      ))}
    </div>
  );
}
