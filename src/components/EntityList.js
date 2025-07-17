export default function EntityList() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Entities</h2>
      <ul className="space-y-2">
        <li className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">Entity A</li>
        <li className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">Entity B</li>
        <li className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">Entity C</li>
      </ul>
    </div>
  );
}
