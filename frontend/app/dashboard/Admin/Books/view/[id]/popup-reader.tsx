"use client";

import React from "react";
import { X, Shield, Clock } from "lucide-react";

export interface Reader {
  id: string;
  username: string;
  email: string;
  readTime: number; // in minutes
  lastAccessed: string;
  isBlocked: boolean;
}

interface PopupReaderProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  readers: Reader[];
  onBlockAccess: (userId: string) => void;
}

export default function PopupReader({
  isOpen,
  onClose,
  documentTitle,
  readers,
  onBlockAccess,
}: PopupReaderProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-black">Document Readers</h2>
            <p className="text-sm text-gray-600 mt-1">{documentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Close"
            type="button"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {readers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No readers yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readers.map((reader) => (
                <div
                  key={reader.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                        {reader.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {reader.username}
                        </h3>
                        <p className="text-sm text-gray-600">{reader.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-3 ml-13">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>
                          {reader.readTime} minute{reader.readTime !== 1 ? "s" : ""} of reading
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Last accessed: {new Date(reader.lastAccessed).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onBlockAccess(reader.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition font-medium ${
                      reader.isBlocked
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                    type="button"
                  >
                    <Shield className="w-4 h-4" />
                    {reader.isBlocked ? "Unblock Access" : "Block Access"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Total readers: <span className="font-semibold text-black">{readers.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
