import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import logo from './assets/logo-midoc.png';
import './App.css';

function App() {
  useEffect(() => {
    document.title = '🩺 MiDoc | Consulta de Atenciones';
  }, []);

  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    cod_ate: '',
    cm_estado: '',
    fec_ate: '',
    nom_pac: '',
    numero_ce: '',
    tar_Ate: '',
    for_ate: '',
    num_operacion_ap: '',
    cod_convenio: '',
  });
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async (start: string, end: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/atencion?start=${start}&end=${end}`);
      setData(res.data);
      setFilteredData(res.data);
    } catch (error) {
      showCustomModal('Error al conectar con el backend.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showCustomModal = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
    setTimeout(() => setShowModal(false), 4000);
  };

  useEffect(() => {
    if (startDate && endDate) {
      const formattedStart = moment(startDate).startOf('day').toISOString();
      const formattedEnd = moment(endDate).endOf('day').toISOString();
      fetchData(formattedStart, formattedEnd);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const result = data.filter((row) =>
      Object.keys(filters).every((key) =>
        String(row[key] || '').toLowerCase().includes(filters[key as keyof typeof filters].toLowerCase())
      )
    );
    setFilteredData(result);
  }, [filters, data]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportToExcel = () => {
    const headers = [
      ['Cod Ate.', 'Estado Ate.', 'Fecha Ate.', 'Paciente', 'Boleta', 'Monto', 'Mét. Pago', 'Num. Operación', 'Convenio']
    ];
    const rows = filteredData.map(row => [
      row.cod_ate,
      row.cm_estado,
      moment(row.fec_ate).format('YYYY-MM-DD'),
      row.nom_pac,
      row.numero_ce,
      row.tar_ate,
      row.for_ate,
      row.num_operacion_ap,
      row.cod_convenio
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Atenciones');
    const blob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([blob], { type: 'application/octet-stream' }),
      `atenciones_${moment(startDate).format('YYYYMMDD')}_a_${moment(endDate).format('YYYYMMDD')}.xlsx`
    );
  };

  const enviarReportePorCorreo = async () => {
    if (!startDate || !endDate) return showCustomModal('Selecciona un rango válido');
    try {
      await axios.post('http://localhost:3000/atencion/enviar-reporte-excel', {
        start: startDate,
        end: endDate,
      });
      showCustomModal('📬 Reporte enviado al correo registrado.');
    } catch (error) {
      showCustomModal('❌ No se pudo enviar el correo.');
      console.error(error);
    }
  };

  return (
    <div className="container py-5">
      {showModal && (
        <div className="custom-modal fade-in position-fixed top-0 start-50 translate-middle-x mt-3">
          <div className="custom-modal-content shadow-lg border rounded bg-white px-4 py-2">
            <p className="fw-semibold text-center m-0 text-dark">{modalMessage}</p>
          </div>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
          <img src={logo} alt="MiDoc logo" height={55} className="rounded-circle border shadow-sm" />
          <h1 className="h4 fw-bold text-primary">MiDoc | Consulta de Atenciones</h1>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              const todayStart = moment().startOf('day').toISOString();
              const todayEnd = moment().endOf('day').toISOString();
              setDateRange([new Date(), new Date()]);
              fetchData(todayStart, todayEnd);
            }}
          >
            Ver Hoy
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              const yesterday = moment().subtract(1, 'day');
              const start = yesterday.startOf('day').toISOString();
              const end = yesterday.endOf('day').toISOString();
              setDateRange([yesterday.toDate(), yesterday.toDate()]);
              fetchData(start, end);
            }}
          >
            Ver Ayer
          </button>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-2 w-100">
          <label className="form-label m-0 fw-semibold">📅 Rango de fechas:</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            isClearable
            placeholderText="Seleccionar rango"
          />
        </div>
        <div className="btn-group mt-2 mt-md-0">
          <button className="btn btn-success" onClick={exportToExcel}>
            📁 Exportar Excel
          </button>
          <button className="btn btn-dark" onClick={enviarReportePorCorreo}>
            📤 Enviar por correo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Cargando datos...</div>
      ) : filteredData.length === 0 ? (
        <div className="alert alert-info">No se encontraron atenciones para esta fecha.</div>
      ) : (
        <div className="table-responsive border rounded shadow-sm p-3 bg-white">
          <table className="table table-striped table-bordered table-sm">
            <thead className="text-center bg-light text-dark">
              <tr>
                <th><input type="text" className="form-control form-control-sm" placeholder="Cod Ate." onChange={(e) => handleFilterChange('cod_ate', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Estado" onChange={(e) => handleFilterChange('cm_estado', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Fecha" onChange={(e) => handleFilterChange('fec_ate', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Paciente" onChange={(e) => handleFilterChange('nom_pac', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Boleta" onChange={(e) => handleFilterChange('numero_ce', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Monto" onChange={(e) => handleFilterChange('tar_Ate', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Mét. Pago" onChange={(e) => handleFilterChange('for_ate', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Operación" onChange={(e) => handleFilterChange('num_operacion_ap', e.target.value)} /></th>
                <th><input type="text" className="form-control form-control-sm" placeholder="Convenio" onChange={(e) => handleFilterChange('cod_convenio', e.target.value)} /></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i}>
                  <td>{row.cod_ate}</td>
                  <td>{row.cm_estado}</td>
                  <td>{moment(row.fec_ate).format('YYYY-MM-DD')}</td>
                  <td>{row.nom_pac}</td>
                  <td>{row.numero_ce}</td>
                  <td>{row.tar_ate}</td>
                  <td>{row.for_ate}</td>
                  <td>{row.num_operacion_ap}</td>
                  <td>{row.cod_convenio}</td>
                </tr>
              ))}
              <tr className="fw-bold bg-light">
                <td colSpan={5} className="text-end">Totales:</td>
                <td>S/. {filteredData.reduce((sum, row) => sum + (parseFloat(row.tar_ate) || 0), 0).toFixed(2)}</td>
                <td colSpan={3}>Registros: {filteredData.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;