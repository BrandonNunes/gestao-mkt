export default function RelatoriosPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Relatórios</h2>
      <p className="text-gray-500">Selecione o tipo de relatório desejado.</p>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <a href="/api/relatorios/equipamentos" className="p-6 border rounded-md hover:bg-gray-50 text-center">Equipamentos</a>
        <a href="/api/relatorios/cautelas" className="p-6 border rounded-md hover:bg-gray-50 text-center">Cautelas</a>
        <a href="/api/relatorios/utilizacao" className="p-6 border rounded-md hover:bg-gray-50 text-center">Utilização</a>
      </div>
    </div>
  );
}
