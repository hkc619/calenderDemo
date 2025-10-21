"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState, useEffect } from "react";

export default function AddMealModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
}: any) {
  const [meals, setMeals] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [mealType, setMealType] = useState("breakfast");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/meals")
        .then((r) => r.json())
        .then((data) => setMeals(data || []));
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!selectedMeal) return;
    onSave({
      title: selectedMeal.title,
      date: selectedDate,
      mealType,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* ✅ 新版背景層 */}
      <DialogBackdrop className="fixed inset-0 bg-black/10 backdrop-blur-sm" />

      {/* ✅ 主視窗 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
          <DialogTitle className="text-lg text-black font-semibold mb-4">
            Add Meal Plan for {selectedDate}
          </DialogTitle>

          {/* Modal 內容區 */}
          <div className="flex text-black justify-between mb-3">
            <label>Meal Type:</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="border text-black rounded px-2 py-1"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2 h-48 overflow-y-auto">
            {meals.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMeal(m)}
                className={`border p-2 rounded text-left ${
                  selectedMeal?.id === m.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                🍽️ {m.title}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
