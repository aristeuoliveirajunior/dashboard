// Enum para tipos de dashboard
export const TiposContextoEnum = {
  Financeiro: 1,
  Abastecimento: 2,
};

// Função para mapear contextos (exportada para testes)
export const mapContextos = () => {
  const result = Object.keys(TiposContextoEnum).map((key) => ({
    id: TiposContextoEnum[key],
    text: key,
  }));

  return result;
};

export const renderChartResponsive = (value) => {
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

export const loadGraph = async (
  data,
  idGrafico,
  setChartHtml,
  setContexto,
  setLoading,
  setChartDescription
) => {
  setLoading(true);

  if (data && data.graficos) {
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
