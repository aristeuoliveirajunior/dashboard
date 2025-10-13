import React, { useState, useEffect } from 'react';
import {
  Panel,
  CSDBasePage,
  Textarea,
  Button,
  Notification,
  DropdownButton,
} from 'ui/components';
import { PageTypes, Theme, ResponseStatus } from 'ui/Helpers/utils';
import { faChartLine, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { renderGraph, loadDashboard } from 'core/services/IA/dashboard';
import { saveDashboardIAUsuario } from 'core/services/IA/dashboardIAUsuario';

// Enum para tipos de dashboard
export const TiposContextoEnum = {
  Financeiro: 1,
  Abastecimento: 2,
};

export default function Dashboard({ transaction }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [contexto1, setContexto1] = useState({});
  const [contexto2, setContexto2] = useState({});
  const [contexto3, setContexto3] = useState({});
  const [contexto4, setContexto4] = useState({});

  const mapContextos = () => {
    const result = Object.keys(TiposContextoEnum).map((key) => ({
      id: TiposContextoEnum[key],
      text: key,
    }));

    return result;
  };

  const getValueContexto = (contexto) => TiposContextoEnum[contexto.text];

  const [chart1Description, setChart1Description] = useState('');
  const [chart2Description, setChart2Description] = useState('');
  const [chart3Description, setChart3Description] = useState('');
  const [chart4Description, setChart4Description] = useState('');

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [message, setMessage] = useState(null);

  const onSetMessage = (status, msg) => {
    if (msg) {
      setMessage({
        message: msg,
        theme: status === ResponseStatus.Success ? Theme.Success : Theme.Danger,
      });
    }
  };

  const [chart1Html, setChart1Html] = useState('');
  const [chart2Html, setChart2Html] = useState('');
  const [chart3Html, setChart3Html] = useState('');
  const [chart4Html, setChart4Html] = useState('');

  const renderChartResponsive = (value) => {
    // Adiciona CSS para fazer o gráfico se ajustar ao iframe
    const responsiveHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 50%;
          height: 50%;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }
        
        .chart-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        canvas, svg {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
        }
        
        /* Para gráficos que usam divs */
        .chart-div {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="chart-container">
        ${value || '<p>Gráfico não disponível</p>'}
      </div>
    </body>
    </html>
  `;

    return responsiveHtml;
  };

  const renderChart = async (
    idGrafico,
    idContexto,
    noPrompt,
    setChartHtml,
    setLoading
  ) => {
    if (!noPrompt.trim()) return;

    setLoading(true);
    try {
      const { status, message: msg, graphHtml } = await renderGraph(
        idGrafico,
        getValueContexto(idContexto),
        noPrompt
      );
      if (status === ResponseStatus.Success) {
        // Atualiza o HTML do gráfico 1
        setChartHtml(renderChartResponsive(graphHtml));
        setRefreshKey((prev) => prev + 1);
        onSetMessage(
          ResponseStatus.Success,
          'Gráfico 1 atualizado com sucesso!'
        );
      } else {
        onSetMessage(
          ResponseStatus.Error,
          msg || 'Erro ao atualizar gráfico 1'
        );
      }
    } catch (error) {
      onSetMessage(ResponseStatus.Error, 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };
  const saveChart = async (idGrafico, contexto, noPrompt, setLoading) => {
    if (!noPrompt.trim()) return;

    setLoading(true);
    try {
      const { status, message: msg } = await saveDashboardIAUsuario({
        idGrafico,
        idContexto: getValueContexto(contexto),
        noPrompt,
      });
      if (status === ResponseStatus.Success) {
        onSetMessage(ResponseStatus.Success, 'Configurações gravadas');
      } else {
        onSetMessage(
          ResponseStatus.Error,
          msg || 'Erro ao gravar configurações'
        );
      }
    } catch (error) {
      onSetMessage(ResponseStatus.Error, 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const loadGraph = async (
    data,
    idGrafico,
    setChartHtml,
    setContexto,
    setLoading,
    setChartDescription
  ) => {
    setLoading(true);

    if (data.graficos) {
      const grafico = data.graficos.find((g) => g.idGrafico === idGrafico);
      if (grafico) {
        setContexto({
          id: grafico.idContexto,
          text: Object.keys(TiposContextoEnum)[grafico.idContexto - 1],
        });
        setChartDescription(grafico.noPrompt);
        if (grafico.noHtml) {
          setChartHtml(renderChartResponsive(grafico.noHtml));
        }
      }
    }

    setLoading(false);
  };

  const load = async () => {
    try {
      const { status, message: msg, data } = await loadDashboard();
      if (status === ResponseStatus.Success && data) {
        await Promise.all([
          loadGraph(
            data,
            1,
            setChart1Html,
            setContexto1,
            setLoading1,
            setChart1Description
          ),
          loadGraph(
            data,
            2,
            setChart2Html,
            setContexto2,
            setLoading2,
            setChart2Description
          ),
          loadGraph(
            data,
            3,
            setChart3Html,
            setContexto3,
            setLoading3,
            setChart3Description
          ),
          loadGraph(
            data,
            4,
            setChart4Html,
            setContexto4,
            setLoading4,
            setChart4Description
          ),
        ]);
      } else {
        onSetMessage(status, msg);
      }
    } catch (error) {
      onSetMessage(ResponseStatus.Error, 'Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CSDBasePage
      page={{
        pageType: PageTypes.Manutencao,
        title: 'Dashboard',
        user: transaction?.user,
      }}
    >
      <div className='container px-3 py-2' style={{ maxWidth: '1400px' }}>
        {message && (
          <div className='mb-2'>
            <Notification
              message={message.message}
              theme={message.theme}
              onClose={() => setMessage(null)}
            />
          </div>
        )}
        <div className='row g-3'>
          {/* Chart 1 Panel */}
          <div className='col-md-6'>
            <Panel className='h-100 shadow-sm' collapsable>
              <Panel.Header
                title='Gráfico 1'
                theme={Theme.Primary}
                icon={faChartLine}
              />
              <Panel.Body>
                <div>
                  <div className='col-6'>
                    <DropdownButton
                      dropdownItems={mapContextos()}
                      selectedItem={contexto1}
                      onSelectItem={(value) => setContexto1(value)}
                    />
                  </div>
                </div>
                <div className='mb-2'>
                  <Textarea
                    label='Descrição do Gráfico'
                    rows={10}
                    text={chart1Description}
                    onChangedValue={(value) => setChart1Description(value)}
                  />
                  <div className='row mt-2'>
                    <div className='col-3'>
                      <Button
                        text={loading1 ? 'Atualizando...' : 'Atualizar Gráfico'}
                        icon={loading1 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          renderChart(
                            1,
                            contexto1,
                            chart1Description,
                            setChart1Html,
                            setLoading1
                          )
                        }
                      />
                    </div>
                    <div className='col'>
                      <Button
                        text={
                          loading1 ? 'Atualizando...' : 'Salvar Configuração'
                        }
                        icon={loading1 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          saveChart(
                            1,
                            contexto1,
                            chart1Description,
                            setLoading1
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div style={{ height: '350px', width: '200%' }}>
                  <iframe
                    key={`chart1-${refreshKey}`}
                    srcDoc={chart1Html || ''}
                    style={{
                      width: '100%',
                      minWidth: '100%',
                      height: '500px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                    title='Chart 1'
                  />
                </div>
              </Panel.Body>
            </Panel>
          </div>

          {/* Chart 2 Panel */}
          <div className='col-md-6'>
            <Panel className='h-100 shadow-sm' collapsable>
              <Panel.Header
                title='Gráfico 2'
                theme={Theme.Primary}
                icon={faChartBar}
              />
              <Panel.Body>
                <div>
                  <div className='col-6'>
                    <DropdownButton
                      dropdownItems={mapContextos()}
                      selectedItem={contexto2}
                      onSelectItem={(value) => setContexto2(value)}
                    />
                  </div>
                </div>
                <div className='mb-2'>
                  <Textarea
                    label='Descrição do Gráfico'
                    rows={10}
                    text={chart2Description}
                    onChangedValue={(value) => setChart2Description(value)}
                    placeholder='Descreva o gráfico que deseja gerar...'
                  />
                  <div className='row mt-2'>
                    <div className='col-4'>
                      <Button
                        text={loading2 ? 'Atualizando...' : 'Atualizar Gráfico'}
                        icon={loading2 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          renderChart(
                            2,
                            contexto2,
                            chart2Description,
                            setChart2Html,
                            setLoading2
                          )
                        }
                        disabled={!chart2Description?.trim() || loading2}
                      />
                    </div>
                    <div className='col'>
                      <Button
                        text={
                          loading2 ? 'Atualizando...' : 'Salvar Configuração'
                        }
                        icon={loading2 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          saveChart(
                            2,
                            contexto2,
                            chart2Description,
                            setLoading2
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div style={{ height: '350px', width: '200%' }}>
                  <iframe
                    key={`chart2-${refreshKey}`}
                    srcDoc={chart2Html || ''}
                    style={{
                      minWidth: '100%',
                      height: '500px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                    title='Chart 2'
                  />
                </div>
              </Panel.Body>
            </Panel>
          </div>
        </div>

        <div className='row g-3'>
          {/* Chart 1 Panel */}
          <div className='col-md-6'>
            <Panel className='h-100 shadow-sm' collapsable>
              <Panel.Header
                title='Gráfico 3'
                theme={Theme.Primary}
                icon={faChartLine}
              />
              <Panel.Body>
                <div>
                  <div className='col-6'>
                    <DropdownButton
                      dropdownItems={mapContextos()}
                      selectedItem={contexto3}
                      onSelectItem={(value) => setContexto3(value)}
                    />
                  </div>
                </div>
                <div className='mb-2'>
                  <Textarea
                    label='Descrição do Gráfico'
                    rows={10}
                    text={chart3Description}
                    onChangedValue={(value) => setChart3Description(value)}
                  />
                  <div className='row mt-2'>
                    <div className='col-4'>
                      <Button
                        text={loading3 ? 'Atualizando...' : 'Atualizar Gráfico'}
                        icon={loading3 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          renderChart(
                            3,
                            contexto3,
                            chart3Description,
                            setChart3Html,
                            setLoading3
                          )
                        }
                      />
                    </div>

                    <div className='col'>
                      <Button
                        text={
                          loading1 ? 'Atualizando...' : 'Salvar Configuração'
                        }
                        icon={loading1 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          saveChart(
                            3,
                            contexto3,
                            chart3Description,
                            setLoading3
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div style={{ height: '350px', width: '200%' }}>
                  <iframe
                    key={`chart3-${refreshKey}`}
                    srcDoc={chart3Html || ''}
                    style={{
                      minWidth: '100%',
                      height: '500px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                    title='Chart 4'
                  />
                </div>
              </Panel.Body>
            </Panel>
          </div>

          {/* Chart 2 Panel */}
          <div className='col-md-6'>
            <Panel className='h-100 shadow-sm' collapsable>
              <Panel.Header
                title='Gráfico 4'
                theme={Theme.Primary}
                icon={faChartBar}
              />
              <Panel.Body>
                <div className='col-6'>
                  <DropdownButton
                    dropdownItems={mapContextos()}
                    selectedItem={contexto4}
                    onSelectItem={(value) => setContexto4(value)}
                  />
                </div>

                <div className='mb-2'>
                  <Textarea
                    label='Descrição do Gráfico'
                    rows={10}
                    text={chart4Description}
                    onChangedValue={(value) => setChart4Description(value)}
                    placeholder='Descreva o gráfico que deseja gerar...'
                  />
                  <div className='row mt-2'>
                    <div className='col-4'>
                      <Button
                        text={loading4 ? 'Atualizando...' : 'Atualizar Gráfico'}
                        icon={loading4 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          renderChart(
                            4,
                            contexto4,
                            chart4Description,
                            setChart4Html,
                            setLoading4
                          )
                        }
                        disabled={!chart4Description.trim() || loading4}
                      />
                    </div>
                    <div className='col'>
                      <Button
                        text={
                          loading1 ? 'Atualizando...' : 'Salvar Configuração'
                        }
                        icon={loading1 ? 'spinner' : 'sync'}
                        theme={Theme.Primary}
                        onClick={() =>
                          saveChart(
                            4,
                            contexto4,
                            chart4Description,
                            setLoading4
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div style={{ height: '350px', width: '200%' }}>
                  <iframe
                    key={`chart4-${refreshKey}`}
                    srcDoc={chart4Html || ''}
                    style={{
                      minWidth: '100%',
                      height: '500px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                    title='Chart 4'
                  />
                </div>
              </Panel.Body>
            </Panel>
          </div>
        </div>

        {/* Additional styling */}
        <style jsx='true'>{`
          .chart-container {
            transition: all 0.3s ease;
          }

          .panel {
            background: white;
            border-radius: 10px;
            overflow: hidden;
          }

          .panel:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          }
        `}</style>
      </div>
    </CSDBasePage>
  );
}
