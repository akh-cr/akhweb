import React from 'react';

export default function TestWidthPage() {
  return (
    <div className="space-y-4 w-full">
      <div className="w-full bg-red-200 p-4">
        Full Width Test (w-full)
      </div>
      <div className="max-w-2xl mx-auto bg-green-200 p-4">
        Max Width 2xl Test
      </div>
      <div className="max-w-5xl mx-auto bg-blue-200 p-4">
        Max Width 5xl Test
      </div>
       <div className="max-w-7xl mx-auto bg-yellow-200 p-4">
        Max Width 7xl Test
      </div>
    </div>
  );
}
