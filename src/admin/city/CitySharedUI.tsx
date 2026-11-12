import React from 'react';
import { AlertTriangle, X, Database } from 'lucide-react';
import { CityProjectStatus, CityPriority, CityRoadCondition } from '../../types';

export function formatPkr(amount: number | undefined | null): string {
  const n = Number(amount || 0);
  if (!n) return 'PKR 0';
  if (n >= 10000000) return `PKR ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(2)} Lac`;
  return `PKR ${n.toLocaleString()}`;
}

export function getProjectStatusBadgeClass(status: CityProjectStatus): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'In Progress':
    case 'Tendering':
    case 'Funds Released':
    case 'Approved':
      return 'bg-green-50 text-[#087A43] border-green-300';
    case 'Delayed':
      return 'bg-red-50 text-red-800 border-red-300';
    case 'Cancelled':
      return 'bg-slate-200 text-slate-700 border-slate-300';
    default:
      return 'bg-amber-50 text-amber-900 border-amber-300';
  }
}

export function getPriorityBadgeClass(priority: CityPriority): string {
  switch (priority) {
    case 'Critical':
      return 'bg-red-100 text-red-900 border-red-300';
    case 'High':
      return 'bg-orange-100 text-orange-900 border-orange-300';
    case 'Medium':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getConditionBadgeClass(cond: CityRoadCondition | string): string {
  switch (cond) {
    case 'Excellent':
    case 'Good':
    case 'Operational':
    case 'Clear':
      return 'bg-emerald-50 text-[#087A43] border-emerald-200';
    case 'Average':
    case 'Partial':
    case 'Needs Desilting':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Poor':
    case 'Critical':
    case 'Non-Functional':
    case 'Blocked':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export const EmptyVerifiedDataNotice: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 text-center space-y-2.5">
    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#087A43] flex items-center justify-center mx-auto">
      <Database className="w-5 h-5" />
    </div>
    <h4 className="font-bold text-sm text-[#123B28]">{title}</h4>
    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-2 min-h-[40px] px-4 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2"
      >
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);

export const ConfirmDeleteModal: React.FC<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-red-700">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#123B28]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
