'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { modal } from '@/lib/motion/presets';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  companyName: string;
}

export function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, isDeleting = false, companyName }: ConfirmDeleteDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
          />
          <motion.div 
            {...modal}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
                <Trash2 className="h-8 w-8 text-rose-600" />
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Delete Application?</h3>
              <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                You are about to delete your application for <span className="font-bold text-neutral-900">{companyName}</span>. 
                This action cannot be undone and all associated activities will be lost.
              </p>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 border-rose-600 text-white font-bold text-base shadow-lg shadow-rose-200"
                  onClick={onConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Application'}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-2xl text-neutral-500 font-semibold text-base hover:bg-neutral-50"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
            
            <div className="bg-amber-50 border-t border-amber-100 px-8 py-4 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                This will also remove it from your dashboard and Focus Zone.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
