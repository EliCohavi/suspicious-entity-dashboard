import EntityList from './components/EntityList';
import EntityDetail from './components/EntityDetail';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex p-6 space-x-4">
        <div className="w-1/3 bg-white p-4 rounded-lg shadow">
          <EntityList />
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow">
          <EntityDetail />
        </div>
      </div>
    </div>
  );
}

export default App;
