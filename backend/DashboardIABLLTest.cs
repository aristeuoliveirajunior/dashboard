using CSDFramework.Extensions;
using CSDModulos.BLL.FRO;
using CSDModulos.BLL.IA;
using CSDModulos.BLL.TEL;
using CSDModulos.DAL.TEL;
using CSDModulos.DTO.TEL;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System;
using System.Collections.Generic;
using Xunit;

namespace CSDProjectTest.IA
{
    public class DashboardIABLLTest : BaseTest
    {

        public DashboardIABLLTest()
        {
         
            Startup();
        }



        #region testes_ ExtrairConsultaDosDados
        [Fact(DisplayName = "ExtrairConsultaDosDados - Deve extrair corretamente o conteúdo entre chaves")]
        public void ExtrairConsultaDosDados_ComInputValido_DeveExtrairConteudo()
        {
            // Arrange
            string input = @"Tipo do Gráfico: {barras} O que será exibido no gráfico: {gerar um gráfico de barras com o somatório da quantidade de litros dos abastecimentos realizados, referente aos dias 7, 8 e 9 de agosto de 2025}";

            string expectedResult = "gerar um gráfico de barras com o somatório da quantidade de litros dos abastecimentos realizados, referente aos dias 7, 8 e 9 de agosto de 2025";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            string result = _dashboardIABLL.ExtrairConsultaDosDados(input);

            // Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact(DisplayName = "ExtrairConsultaDosDados - Deve retornar vazio quando input é nulo")]
        public void ExtrairConsultaDosDados_ComInputNulo_DeveRetornarVazio()
        {
            // Arrange
            string input = null;

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Act
            string result = _dashboardIABLL.ExtrairConsultaDosDados(input);

            // Assert
            Assert.Equal(string.Empty, result);
        }

        [Fact(DisplayName = "ExtrairConsultaDosDados - Deve retornar vazio quando input está vazio")]
        public void ExtrairConsultaDosDados_ComInputVazio_DeveRetornarVazio()
        {
            // Arrange
            string input = "";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            string result = _dashboardIABLL.ExtrairConsultaDosDados(input);

            // Assert
            Assert.Equal(string.Empty, result);
        }

        [Fact(DisplayName = "ExtrairConsultaDosDados - Deve retornar vazio quando não encontrar o padrão")]
        public void ExtrairConsultaDosDados_SemPadrao_DeveRetornarVazio()
        {
            // Arrange
            string input = "Texto sem padrão esperado";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            string result = _dashboardIABLL.ExtrairConsultaDosDados(input);

            // Assert
            Assert.Equal(string.Empty, result);
        }

        [Fact(DisplayName = "ExtrairConsultaDosDados - Deve funcionar com case insensitive")]
        public void ExtrairConsultaDosDados_ComCaseInsensitive_DeveFuncionar()
        {
            // Arrange
            string input = @"Tipo do Gráfico: {barras} o QUE SERÁ exibido NO gráfico: {conteúdo em case diferente}";

            string expectedResult = "conteúdo em case diferente";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Act
            string result = _dashboardIABLL.ExtrairConsultaDosDados(input);

            // Assert
            Assert.Equal(expectedResult, result);
        }

        [Fact(DisplayName = "ExtrairConsultaDosDados - Deve remover espaços em branco extras")]
        public void ExtrairConsultaDosDados_ComEspacosExtras_DeveRemoverEspacos()
        {
            // Arrange
            string input = @"Tipo do Gráfico: {barras} O que será exibido no gráfico:   {   conteúdo com espaços   }";

            string expectedResult = "conteúdo com espaços";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Act
            string result = _dashboardIABLL.ExtrairConsultaDosDados(input);

            // Assert
            Assert.Equal(expectedResult, result);
        }

        #endregion

        #region testes_Extrair_SQL

        [Fact(DisplayName = "ExtractSql - Deve remover espaços em branco extras")]
        public void Deve_Extrair_Sql_Quando_Bem_Formatado()
        {
            // Arrange
            string entrada = "Texto qualquer\n```sql\nSELECT * FROM clientes;\n```";
            string esperado = "SELECT * FROM clientes;";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Act
            string resultado = _dashboardIABLL.ExtractSql(entrada);

            // Assert
            Assert.Equal(esperado, resultado);
        }


        [Fact(DisplayName = "ExtractSql - Deve_Extrair_Sql_Com_Escape_Literal_De_Nova_Linha")]
        public void Deve_Extrair_Sql_Com_Escape_Literal_De_Nova_Linha()
        {
            // Arrange
            string entrada = "```sql\nSELECT * FROM produtos WHERE nome LIKE '%caneta%';\\nORDER BY preco;\n```";
            string esperado = $"SELECT * FROM produtos WHERE nome LIKE '%caneta%';{Environment.NewLine}ORDER BY preco;";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            string resultado = _dashboardIABLL.ExtractSql(entrada);

            // Assert
            Assert.Equal(esperado, resultado);
        }


        [Fact(DisplayName = "ExtractSql - Deve_Retornar_Null_Se_Nao_Houver_Blocos_Sql")]
        public void Deve_Retornar_Null_Se_Nao_Houver_Blocos_Sql()
        {
            // Arrange
            string entrada = "Não tem nenhum bloco sql aqui.";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Act
            string resultado = _dashboardIABLL.ExtractSql(entrada);

            // Assert
            Assert.Null(resultado);
        }


        [Fact(DisplayName = "ExtractSql - Deve_Ignorar_Case_Do_Marcador_Sql")]
        public void Deve_Ignorar_Case_Do_Marcador_Sql()
        {
            // Arrange
            string entrada = "```SQL\nSELECT 1;\n```";
            string esperado = "SELECT 1;";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            string resultado = _dashboardIABLL.ExtractSql(entrada);

            // Assert
            Assert.Equal(esperado, resultado);
        }


        [Fact(DisplayName = "ExtractSql - Deve_Manter_Quebras_De_Linha_Reais")]
        public void Deve_Manter_Quebras_De_Linha_Reais()
        {
            // Arrange
            string entrada = "```sql\nSELECT *\nFROM tabela\nWHERE ativo = 1;\n```";
            string esperado = "SELECT *\nFROM tabela\nWHERE ativo = 1;";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            string resultado = _dashboardIABLL.ExtractSql(entrada);

            // Assert
            Assert.Equal(esperado, resultado);
        }



        #endregion

        #region testes_GetFinalPrompt

        [Fact(DisplayName = "GetFinalPrompt_Deve_Incluir_Json_E_Descricao")]
        public void GetFinalPrompt_Deve_Incluir_Json_E_Descricao()
        {
            // Arrange
            var json = "{\"labels\": [\"A\", \"B\"], \"data\": [10, 20]}";
            var descricao = "a bar chart of values A and B";

            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();
            // Act
            var resultado = _dashboardIABLL.GetFinalPrompt(json, descricao);

            // Assert
            Assert.Contains(json, resultado);
            Assert.Contains(descricao, resultado);
            Assert.Contains("Chart.js", resultado);
            Assert.Contains("myChart", resultado);
        }

        #endregion

        #region testes_ExtrairHTML

        [Fact(DisplayName = "ExtracHtml_DeveRetornarVazio_SeTextoForNuloOuBranco")]
        public void ExtracHtml_DeveRetornarVazio_SeTextoForNuloOuBranco()
        {
            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            Assert.Equal(string.Empty, _dashboardIABLL.ExtracHtml(null));
            Assert.Equal(string.Empty, _dashboardIABLL.ExtracHtml(""));
            Assert.Equal(string.Empty, _dashboardIABLL.ExtracHtml("    "));
        }


        [Fact(DisplayName = "ExtracHtml_DeveExtrairHeadBodyEScript_DeHtmlCompleto")]
        public void ExtracHtml_DeveExtrairHeadBodyEScript_DeHtmlCompleto()
        {
            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Arrange
            var input = @"
            <html>
                <head><style>body { background: red; }</style></head>
                <body><canvas id='myChart'></canvas></body>
                <script>console.log('hello');</script>
            </html>";

            // Act
            var resultado = _dashboardIABLL.ExtracHtml(input);

            // Assert
            Assert.Contains("<style>body { background: red; }</style>", resultado);
            Assert.Contains("<canvas id='myChart'></canvas>", resultado);
            Assert.Contains("<script>console.log('hello');</script>", resultado);
            Assert.StartsWith("<!DOCTYPE html>", resultado.Trim());
            Assert.EndsWith("</html>", resultado.Trim());
        }


        [Fact(DisplayName = "ExtracHtml_DeveExtrairTagsSeparadas_SeNaoHouverHtmlCompleto")]
        public void ExtracHtml_DeveExtrairTagsSeparadas_SeNaoHouverHtmlCompleto()
        {
            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Arrange
            var input = @"
            <head><style>.class { color: blue; }</style></head>
            <body><canvas id='c1'></canvas></body>
            <script src='grafico.js'></script>";

            // Act
            var resultado = _dashboardIABLL.ExtracHtml(input);

            // Assert
            Assert.Contains("<style>.class { color: blue; }</style>", resultado);
            Assert.Contains("<canvas id='c1'></canvas>", resultado);
            Assert.Contains("<script src='grafico.js'></script>", resultado);
            Assert.StartsWith("<!DOCTYPE html>", resultado.Trim());
            Assert.Contains("<html", resultado);
            Assert.Contains("<body>", resultado);
        }


        [Fact(DisplayName = "ExtracHtml_DeveExtrairMultiplosBlocosHtml")]
        public void ExtracHtml_DeveExtrairMultiplosBlocosHtml()
        {
            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Arrange
            var input = @"
            <html>
                <head><title>Primeiro</title></head>
                <body>Primeiro corpo</body>
                <script>console.log('1');</script>
            </html>
            <html>
                <head><title>Segundo</title></head>
                <body>Segundo corpo</body>
                <script>console.log('2');</script>
            </html>";

            // Act
            var resultado = _dashboardIABLL.ExtracHtml(input);

            // Assert
            Assert.Contains("<title>Primeiro</title>", resultado);
            Assert.Contains("<title>Segundo</title>", resultado);
            Assert.Contains("Primeiro corpo", resultado);
            Assert.Contains("Segundo corpo", resultado);
            Assert.Contains("console.log('1')", resultado);
            Assert.Contains("console.log('2')", resultado);
        }



        [Fact(DisplayName = "ExtracHtml_DeveAdicionarEstruturaPadrao")]
        public void ExtracHtml_DeveAdicionarEstruturaPadrao()
        {
            var _dashboardIABLL = serviceprovider.GetService<DashboardIABLL>();

            // Arrange
            var input = "<body><div>Teste</div></body>";

            // Act
            var resultado = _dashboardIABLL.ExtracHtml(input);

            // Assert
            Assert.Contains("<!DOCTYPE html>", resultado);
            Assert.Contains("<html lang=\"pt-BR\">", resultado);
            Assert.Contains("<meta charset=\"UTF-8\">", resultado);
            Assert.Contains("<title>Gráfico</title>", resultado);
        }


        #endregion

    }
}
