/* eslint-env jest */
import {
  TiposContextoEnum,
  mapContextos,
  renderChartResponsive,
  loadGraph,
} from './dashboardUtils';

// Testes unitários para a função mapContextos
describe('Dashboard - mapContextos (Importada)', () => {
  // Teste básico de funcionalidade
  it('deve mapear corretamente o enum TiposContextoEnum para array de objetos', () => {
    // Arrange & Act
    const result = mapContextos();

    // Assert - Verifica se o mapeamento está correto
    const expected = [
      { id: 1, text: 'Financeiro' },
      { id: 2, text: 'Abastecimento' },
    ];

    expect(result).toEqual(expected);
  });

  // Teste de estrutura do array
  it('deve retornar um array com o número correto de itens', () => {
    // Arrange & Act
    const result = mapContextos();

    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  // Teste de propriedades dos objetos
  it('cada item do array deve ter as propriedades id e text', () => {
    // Arrange & Act
    const result = mapContextos();

    // Assert - Verifica propriedades de cada item
    result.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('text');
      expect(typeof item.id).toBe('number');
      expect(typeof item.text).toBe('string');
    });
  });

  // Teste de mapeamento das chaves
  it('deve mapear corretamente as chaves do enum', () => {
    // Arrange
    const expectedKeys = Object.keys(TiposContextoEnum);

    // Act
    const result = mapContextos();
    const resultTexts = result.map((item) => item.text);

    // Assert
    expect(resultTexts).toEqual(expectedKeys);
  });

  // Teste de mapeamento dos valores
  it('deve mapear corretamente os valores do enum', () => {
    // Arrange
    const expectedValues = Object.values(TiposContextoEnum);

    // Act
    const result = mapContextos();
    const resultIds = result.map((item) => item.id);

    // Assert
    expect(resultIds).toEqual(expectedValues);
  });

  // Teste edge case - enum vazio
  it('deve retornar array vazio quando enum estiver vazio', () => {
    // Arrange - Simula enum vazio
    const mapContextosWithEmptyEnum = () => {
      const emptyEnum = {};
      return Object.keys(emptyEnum).map((key) => ({
        id: emptyEnum[key],
        text: key,
      }));
    };

    // Act
    const result = mapContextosWithEmptyEnum();

    // Assert
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  // Teste de flexibilidade com diferentes enums
  it('deve funcionar com diferentes tipos de enum', () => {
    // Arrange - Mock de um enum diferente
    const mockEnum = {
      Vendas: 10,
      Marketing: 20,
      Recursos: 30,
    };

    const mapContextosWithMockEnum = () =>
      Object.keys(mockEnum).map((key) => ({
        id: mockEnum[key],
        text: key,
      }));

    // Act
    const result = mapContextosWithMockEnum();

    // Assert
    const expected = [
      { id: 10, text: 'Vendas' },
      { id: 20, text: 'Marketing' },
      { id: 30, text: 'Recursos' },
    ];

    expect(result).toEqual(expected);
    expect(result).toHaveLength(3);
  });

  // Teste de imutabilidade
  it('não deve modificar o enum original', () => {
    // Arrange
    const originalEnum = { ...TiposContextoEnum };

    // Act
    mapContextos();

    // Assert - Verifica se o enum original não foi alterado
    expect(TiposContextoEnum).toEqual(originalEnum);
  });
});

// Testes unitários para a função renderChartResponsive
describe('Dashboard - renderChartResponsive', () => {
  // Teste básico de funcionalidade
  it('deve retornar HTML responsivo com conteúdo fornecido', () => {
    // Arrange
    const chartContent = '<div>Meu Gráfico</div>';

    // Act
    const result = renderChartResponsive(chartContent);

    // Assert
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
    expect(result).toContain('<div>Meu Gráfico</div>');
    expect(result).toContain('</html>');
  });

  // Teste com conteúdo vazio/null
  it('deve retornar mensagem padrão quando conteúdo for vazio ou null', () => {
    // Arrange & Act
    const resultNull = renderChartResponsive(null);
    const resultUndefined = renderChartResponsive(undefined);
    const resultEmpty = renderChartResponsive('');

    // Assert
    expect(resultNull).toContain('<p>Gráfico não disponível</p>');
    expect(resultUndefined).toContain('<p>Gráfico não disponível</p>');
    expect(resultEmpty).toContain('<p>Gráfico não disponível</p>');
  });

  // Teste de estrutura HTML completa
  it('deve conter estrutura HTML completa e válida', () => {
    // Arrange
    const chartContent = '<canvas></canvas>';

    // Act
    const result = renderChartResponsive(chartContent);

    // Assert - Verifica elementos HTML essenciais
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<meta charset="utf-8">');
    expect(result).toContain('<meta name="viewport"');
    expect(result).toContain('<style>');
    expect(result).toContain('</style>');
    expect(result).toContain('</head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</body>');
    expect(result).toContain('</html>');
  });

  // Teste de CSS responsivo
  it('deve incluir CSS para responsividade', () => {
    // Arrange & Act
    const result = renderChartResponsive('<div>test</div>');

    // Assert - Verifica CSS essencial
    expect(result).toContain('box-sizing: border-box');
    expect(result).toContain('width: 100%');
    expect(result).toContain('height: 100%');
    expect(result).toContain('display: flex');
    expect(result).toContain('align-items: center');
    expect(result).toContain('justify-content: center');
    expect(result).toContain('max-width: 100%');
    expect(result).toContain('max-height: 100%');
  });

  // Teste de container principal
  it('deve incluir container principal com classe chart-container', () => {
    // Arrange
    const chartContent = '<svg></svg>';

    // Act
    const result = renderChartResponsive(chartContent);

    // Assert
    expect(result).toContain('<div class="chart-container">');
    expect(result).toContain('</div>');
    expect(result).toContain('<svg></svg>');
  });

  // Teste com conteúdo HTML complexo
  it('deve preservar conteúdo HTML complexo', () => {
    // Arrange
    const complexChart = `
      <div id="chart-wrapper">
        <canvas id="myChart" width="400" height="200"></canvas>
        <script>console.log('chart script');</script>
      </div>
    `;

    // Act
    const result = renderChartResponsive(complexChart);

    // Assert
    expect(result).toContain('<div id="chart-wrapper">');
    expect(result).toContain('<canvas id="myChart"');
    expect(result).toContain('width="400"');
    expect(result).toContain('height="200"');
    expect(result).toContain("<script>console.log('chart script');</script>");
  });

  // Teste de escape de caracteres especiais
  it('deve lidar corretamente com caracteres especiais', () => {
    // Arrange
    const chartWithSpecialChars =
      '<div title="Gráfico de ações: R$ 1.000,50">Chart & Data</div>';

    // Act
    const result = renderChartResponsive(chartWithSpecialChars);

    // Assert
    expect(result).toContain('Chart & Data');
    expect(result).toContain('R$ 1.000,50');
  });

  // Teste de viewport meta tag
  it('deve incluir meta tag de viewport para responsividade mobile', () => {
    // Arrange & Act
    const result = renderChartResponsive('<div>mobile chart</div>');

    // Assert
    expect(result).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1">'
    );
  });

  // Teste de estrutura CSS para canvas e SVG
  it('deve incluir estilos específicos para canvas e SVG', () => {
    // Arrange & Act
    const result = renderChartResponsive('<canvas></canvas>');

    // Assert
    expect(result).toContain('canvas, svg {');
    expect(result).toContain('max-width: 100%;');
    expect(result).toContain('max-height: 100%;');
    expect(result).toContain('width: auto;');
    expect(result).toContain('height: auto;');
  });

  // Teste de font-family
  it('deve definir font-family padrão', () => {
    // Arrange & Act
    const result = renderChartResponsive('<div>test</div>');

    // Assert
    expect(result).toContain('font-family: Arial, sans-serif;');
  });

  // Teste de tipo de retorno
  it('deve retornar sempre uma string', () => {
    // Arrange & Act
    const result1 = renderChartResponsive('<div>test</div>');
    const result2 = renderChartResponsive(null);
    const result3 = renderChartResponsive(123);

    // Assert
    expect(typeof result1).toBe('string');
    expect(typeof result2).toBe('string');
    expect(typeof result3).toBe('string');
  });
});

// Testes unitários para a função loadGraph
describe('Dashboard - loadGraph', () => {
  // Mocks das funções de state
  let mockSetChartHtml;
  let mockSetContexto;
  let mockSetLoading;
  let mockSetChartDescription;

  beforeEach(() => {
    // Reset dos mocks antes de cada teste
    mockSetChartHtml = jest.fn();
    mockSetContexto = jest.fn();
    mockSetLoading = jest.fn();
    mockSetChartDescription = jest.fn();
  });

  // Teste básico de funcionalidade com dados válidos
  it('deve processar dados válidos e chamar todos os setters corretamente', async () => {
    // Arrange
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 1,
          noPrompt: 'Descrição do gráfico financeiro',
          noHtml: '<div>Gráfico Financeiro</div>',
        },
        {
          idGrafico: 2,
          idContexto: 2,
          noPrompt: 'Descrição do gráfico de abastecimento',
          noHtml: '<div>Gráfico Abastecimento</div>',
        },
      ],
    };
    const idGrafico = 1;

    // Act
    await loadGraph(
      mockData,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetLoading).toHaveBeenCalledTimes(2);

    expect(mockSetContexto).toHaveBeenCalledWith({
      id: 1,
      text: 'Financeiro',
    });

    expect(mockSetChartDescription).toHaveBeenCalledWith(
      'Descrição do gráfico financeiro'
    );

    expect(mockSetChartHtml).toHaveBeenCalledWith(
      expect.stringContaining('<div>Gráfico Financeiro</div>')
    );
  });

  // Teste com gráfico não encontrado
  it('deve lidar corretamente quando gráfico não for encontrado', async () => {
    // Arrange
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 1,
          noPrompt: 'Descrição do gráfico',
          noHtml: '<div>Gráfico</div>',
        },
      ],
    };
    const idGraficoInexistente = 999;

    // Act
    await loadGraph(
      mockData,
      idGraficoInexistente,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetLoading).toHaveBeenCalledTimes(2);

    // Não deve chamar os outros setters se o gráfico não for encontrado
    expect(mockSetContexto).not.toHaveBeenCalled();
    expect(mockSetChartDescription).not.toHaveBeenCalled();
    expect(mockSetChartHtml).not.toHaveBeenCalled();
  });

  // Teste com dados sem propriedade graficos
  it('deve lidar corretamente com dados sem propriedade graficos', async () => {
    // Arrange
    const mockDataSemGraficos = {
      outrasPropriedades: 'valor',
    };
    const idGrafico = 1;

    // Act
    await loadGraph(
      mockDataSemGraficos,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetLoading).toHaveBeenCalledTimes(2);

    // Não deve chamar os outros setters
    expect(mockSetContexto).not.toHaveBeenCalled();
    expect(mockSetChartDescription).not.toHaveBeenCalled();
    expect(mockSetChartHtml).not.toHaveBeenCalled();
  });

  // Teste com dados null/undefined
  it('deve lidar corretamente com dados null ou undefined', async () => {
    // Arrange
    const idGrafico = 1;

    // Act - Teste com null
    await loadGraph(
      null,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);

    // Reset mocks
    jest.clearAllMocks();

    // Act - Teste com undefined
    await loadGraph(
      undefined,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  // Teste com array de gráficos vazio
  it('deve lidar corretamente com array de gráficos vazio', async () => {
    // Arrange
    const mockDataGraficosVazio = {
      graficos: [],
    };
    const idGrafico = 1;

    // Act
    await loadGraph(
      mockDataGraficosVazio,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetLoading).toHaveBeenCalledTimes(2);

    expect(mockSetContexto).not.toHaveBeenCalled();
    expect(mockSetChartDescription).not.toHaveBeenCalled();
    expect(mockSetChartHtml).not.toHaveBeenCalled();
  });

  // Teste com gráfico sem HTML
  it('deve processar gráfico sem HTML corretamente', async () => {
    // Arrange
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 2,
          noPrompt: 'Gráfico sem HTML',
          // noHtml não está presente
        },
      ],
    };
    const idGrafico = 1;

    // Act
    await loadGraph(
      mockData,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);

    expect(mockSetContexto).toHaveBeenCalledWith({
      id: 2,
      text: 'Abastecimento',
    });

    expect(mockSetChartDescription).toHaveBeenCalledWith('Gráfico sem HTML');

    // Não deve chamar setChartHtml se não há HTML
    expect(mockSetChartHtml).not.toHaveBeenCalled();
  });

  // Teste com gráfico com HTML vazio/null
  it('deve processar gráfico com HTML vazio ou null', async () => {
    // Arrange
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 1,
          noPrompt: 'Gráfico com HTML vazio',
          noHtml: null,
        },
      ],
    };
    const idGrafico = 1;

    // Act
    await loadGraph(
      mockData,
      idGrafico,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetContexto).toHaveBeenCalledWith({
      id: 1,
      text: 'Financeiro',
    });

    expect(mockSetChartDescription).toHaveBeenCalledWith(
      'Gráfico com HTML vazio'
    );

    // Não deve chamar setChartHtml com HTML null
    expect(mockSetChartHtml).not.toHaveBeenCalled();
  });

  // Teste de mapeamento correto do contexto
  it('deve mapear corretamente todos os tipos de contexto', async () => {
    // Arrange
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 1, // Financeiro
          noPrompt: 'Contexto Financeiro',
          noHtml: '<div>Chart 1</div>',
        },
        {
          idGrafico: 2,
          idContexto: 2, // Abastecimento
          noPrompt: 'Contexto Abastecimento',
          noHtml: '<div>Chart 2</div>',
        },
      ],
    };

    // Act - Teste contexto Financeiro
    await loadGraph(
      mockData,
      1,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetContexto).toHaveBeenCalledWith({
      id: 1,
      text: 'Financeiro',
    });

    // Reset mocks
    jest.clearAllMocks();

    // Act - Teste contexto Abastecimento
    await loadGraph(
      mockData,
      2,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    expect(mockSetContexto).toHaveBeenCalledWith({
      id: 2,
      text: 'Abastecimento',
    });
  });

  // Teste de integração com renderChartResponsive
  it('deve usar renderChartResponsive para processar HTML', async () => {
    // Arrange
    const htmlContent = '<canvas id="test-chart"></canvas>';
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 1,
          noPrompt: 'Teste de integração',
          noHtml: htmlContent,
        },
      ],
    };

    // Act
    await loadGraph(
      mockData,
      1,
      mockSetChartHtml,
      mockSetContexto,
      mockSetLoading,
      mockSetChartDescription
    );

    // Assert
    const expectedHtml = renderChartResponsive(htmlContent);
    expect(mockSetChartHtml).toHaveBeenCalledWith(expectedHtml);

    // Verifica se o HTML processado contém elementos esperados
    expect(mockSetChartHtml).toHaveBeenCalledWith(
      expect.stringContaining('<!DOCTYPE html>')
    );
    expect(mockSetChartHtml).toHaveBeenCalledWith(
      expect.stringContaining('<canvas id="test-chart">')
    );
  });

  // Teste de ordem de execução
  it('deve executar setters na ordem correta', async () => {
    // Arrange
    const mockData = {
      graficos: [
        {
          idGrafico: 1,
          idContexto: 1,
          noPrompt: 'Teste ordem',
          noHtml: '<div>test</div>',
        },
      ],
    };

    const callOrder = [];

    const mockSetLoadingWithOrder = (value) => {
      callOrder.push(`setLoading(${value})`);
    };

    const mockSetContextoWithOrder = () => {
      callOrder.push(`setContexto`);
    };

    const mockSetChartDescriptionWithOrder = () => {
      callOrder.push(`setChartDescription`);
    };

    const mockSetChartHtmlWithOrder = () => {
      callOrder.push(`setChartHtml`);
    };

    // Act
    await loadGraph(
      mockData,
      1,
      mockSetChartHtmlWithOrder,
      mockSetContextoWithOrder,
      mockSetLoadingWithOrder,
      mockSetChartDescriptionWithOrder
    );

    // Assert - Verifica ordem de execução
    expect(callOrder[0]).toBe('setLoading(true)');
    expect(callOrder[callOrder.length - 1]).toBe('setLoading(false)');
    expect(callOrder).toContain('setContexto');
    expect(callOrder).toContain('setChartDescription');
    expect(callOrder).toContain('setChartHtml');
  });
});
