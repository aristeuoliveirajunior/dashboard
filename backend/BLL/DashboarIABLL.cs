using CSDFramework;
using CSDModulos.BLL.FIN;
using CSDModulos.BLL.IA.Models;
using CSDModulos.DAL.FIN;
using CSDModulos.DAL.FRO;
using CSDModulos.DAL.OPT;
using CSDModulos.DAL.SEG;
using CSDModulos.DTO.FIN;
using CSDModulos.DTO.IA;
using DocumentFormat.OpenXml.Office.CoverPageProps;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.SemanticKernel;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;


namespace CSDModulos.BLL.IA
{
    public class DashboardIABLL : BaseBLL
    {
        private readonly AbastecimentoDAL abastecimentoDAL;
        private readonly DashboardIAUsuarioBLL dashboardUsuarioIABLL;
        private readonly Kernel _kernel;

        public DashboardIABLL(AbastecimentoDAL abastecimentoDAL, DashboardIAUsuarioBLL dashBoardIAAUsuarioBLL, Kernel kernel, ISessionContext session,
            EmpresaDAL empresaDAL) : base(session, empresaDAL)
        {
            this.abastecimentoDAL = abastecimentoDAL;
            this.dashboardUsuarioIABLL = dashBoardIAAUsuarioBLL;
            this._kernel = kernel;

        }


        //public string ExtractSql(string texto)
        //{
        //    // 1. Remove marcações de bloco markdown como ```sql ... ```
        //    texto = Regex.Replace(texto, @"```sql|```", "", RegexOptions.IgnoreCase).Trim();

        //    // 2. Regex abrangente que captura um bloco SQL iniciado por SELECT até o fim do comando
        //    //    Considera múltiplas linhas, com ou sem ponto e vírgula no final
        //    var match = Regex.Match(
        //        texto,
        //        @"(?i)(SELECT\s+[\s\S]+?(FROM|JOIN)[\s\S]+?)(?=\n{2,}|\Z)", // Para múltiplas linhas
        //        RegexOptions.IgnoreCase | RegexOptions.Singleline
        //    );

        //    if (!match.Success)
        //        return null;

        //    string sqlBruto = match.Groups[1].Value.Trim();

        //    // Substitui '\n' literais por quebras de linha reais
        //    sqlBruto = sqlBruto.Replace(@"\n", Environment.NewLine);

        //    return sqlBruto;
        //}


        
        public string ExtractSql(string texto)
        {
            // 1. Captura apenas conteúdo entre blocos ```sql ... ```
            var blocoSql = Regex.Match(texto, @"```sql\s*(.*?)\s*```", RegexOptions.IgnoreCase | RegexOptions.Singleline);

            if (!blocoSql.Success)
                return null;

            string sqlBruto = blocoSql.Groups[1].Value.Trim();

            // 2. Substitui '\n' literais por quebras de linha reais
            sqlBruto = sqlBruto.Replace(@"\n", Environment.NewLine);

            return sqlBruto;
        }

     




        public string ExtracHtml(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            var builder = new StringBuilder();

            // Inicializa partes separadas
            var headBuilder = new StringBuilder();
            var bodyBuilder = new StringBuilder();
            var scriptBuilder = new StringBuilder();

            // Regex para capturar todo o bloco HTML
            var htmlBlocks = Regex.Matches(texto, @"<html.*?>[\s\S]*?</html>", RegexOptions.IgnoreCase);

            // Se houver blocos HTML completos
            foreach (Match match in htmlBlocks)
            {
                string blocoHtml = match.Value;

                // Extrair <head>
                var headMatch = Regex.Match(blocoHtml, @"<head.*?>([\s\S]*?)<\/head>", RegexOptions.IgnoreCase);
                if (headMatch.Success)
                    headBuilder.AppendLine(headMatch.Groups[1].Value);

                // Extrair <body>
                var bodyMatch = Regex.Match(blocoHtml, @"<body.*?>([\s\S]*?)<\/body>", RegexOptions.IgnoreCase);
                if (bodyMatch.Success)
                    bodyBuilder.AppendLine(bodyMatch.Groups[1].Value);

                // Extração do código JavaScript (independente de estar dentro de <script> no <head> ou <body>)
                var scripts = Regex.Matches(blocoHtml, @"<script[\s\S]*?<\/script>", RegexOptions.IgnoreCase);
                foreach (Match script in scripts)
                {
                    scriptBuilder.AppendLine(script.Value);  // Adiciona todos os scripts (internos e externos)
                }
            }

            // Fallback: caso não haja blocos <html> completos, tente capturar fragmentos de <head>, <body>, <script>
            if (htmlBlocks.Count == 0)
            {
                // Captura as tags <head>, <body>, <canvas> e <script> separadas
                var heads = Regex.Matches(texto, @"<head.*?>[\s\S]*?<\/head>", RegexOptions.IgnoreCase);
                foreach (Match head in heads)
                    headBuilder.AppendLine(head.Value);

                var bodies = Regex.Matches(texto, @"<body.*?>[\s\S]*?<\/body>|<canvas.*?>[\s\S]*?<\/canvas>", RegexOptions.IgnoreCase);
                foreach (Match body in bodies)
                    bodyBuilder.AppendLine(body.Value);

                var scripts = Regex.Matches(texto, @"<script[\s\S]*?<\/script>", RegexOptions.IgnoreCase);
                foreach (Match script in scripts)
                {
                    scriptBuilder.AppendLine(script.Value);  // Todos os scripts (internos ou externos)
                }
            }

            // Construir HTML final
            builder.AppendLine("<!DOCTYPE html>");
            builder.AppendLine("<html lang=\"pt-BR\">");

            builder.AppendLine("<head>");
            builder.AppendLine("<meta charset=\"UTF-8\">");
            builder.AppendLine("<title>Gráfico</title>");
            builder.AppendLine(headBuilder.ToString());
            builder.AppendLine("</head>");

            builder.AppendLine("<body>");
            builder.AppendLine(bodyBuilder.ToString());
            builder.AppendLine(scriptBuilder.ToString()); // Insere todos os scripts encontrados
            builder.AppendLine("</body>");

            builder.AppendLine("</html>");

            return builder.ToString();
        }

        public string DataSetToJson(DataSet dataSet)
        {
            var tablesList = new List<Dictionary<string, object>>();

            foreach (DataTable table in dataSet.Tables)
            {
                var rowsList = new List<Dictionary<string, object>>();

                foreach (DataRow row in table.Rows)
                {
                    var rowDict = new Dictionary<string, object>();

                    foreach (DataColumn col in table.Columns)
                    {
                        rowDict[col.ColumnName] = row[col];
                    }

                    rowsList.Add(rowDict);
                }

                tablesList.Add(new Dictionary<string, object>
        {
            { table.TableName ?? "Table", rowsList }
        });
            }

            return JsonConvert.SerializeObject(tablesList, Formatting.Indented);
        }

        

        private string GetContextoAbastecimento()
        {
            string sqlStructure = @$" 
                <schema>
				CREATE TABLE [dbo].[ABASTECIMENTO](
					[NRSEQABASTECIMENTO] [numeric](6, 0) NOT NULL PRIMARY KEY,
					[DTABASTECIMENTO] [datetime] NULL -- data do abastecimento,
					[NRODOMETRO] [numeric](11, 0) NULL --odometro que o veiculo estava no momento do abastecimento,
					[NRQUILOMETRAGEM] [numeric](11, 0) NULL,
					[NRSEQVEICULO] [numeric](6, 0) NULL,
					[QTDELITRO] [numeric](12, 4) NULL --quantidade de litros no abastecimento,
					[VLRLITRO] [numeric](14, 4) NULL --valor do litro no abastecimento,
					[VLRDESPESA] [numeric](12, 2) NULL,
					[VLRTOTAL] [numeric](12, 2) NULL --valor total pago pelo abastecimento
					
					),

                CREATE TABLE [dbo].[VEICULO](
	                [NRSEQVEICULO] [numeric](6, 0) NOT NULL PRIMARY KEY,
	                [PLACA] [varchar](7) NULL
	            )</schema>";

            return sqlStructure;
        }

        private string GetContextoFinanceiro()
        {
            string sqlStructure = @$" 
                <schema> CREATE TABLE [dbo].[TITULOPAGAR] 
                ( 
                    [NRSEQTITULOPAGAR] [numeric](8, 0) PRIMARY KEY, 
                    [VLRTITULO] [numeric](12, 2), --valor, valor do título, a pagar 
                    [DTVENCIMENTO] [datetime] , --data do vencimento 
                    [DTCAD] [datetime] , --data de lançamento, data, data do cadastro 
                    [VLRPAGO] [numeric](12, 2), --valor pago, valor 
                    [VLRSALDOTIT] [numeric](12, 2), --saldo em aberto, valor a pagar 
                    [NRSEQTIPODESPESA] [numeric](6, 0) FOREIGN KEY , 
                    [NRSEQPESSOAFOR] [numeric](8, 0) FOREIGN KEY  
                ) 

                CREATE TABLE [dbo].[TIPODESPESA]
                (  
                    [NRSEQTIPODESPESA] [numeric](6, 0) PRIMARY KEY, 
                    [NOTIPODESPESA] varchar --tipo de despesa, despesa, nome da despesa 
                ), 

                CREATE TABLE [dbo].[PESSOA] 
                (  
                    [NRSEQPESSOA] [numeric](8, 0) PRIMARY KEY, --nrseqpessafor  
                    [NOPESSOA] varchar --nome do fornecedor  
                )  

            </schema> ";

            return sqlStructure;
        }

         //<example>
         //           Correct syntax:
         //           SELECT TOP 5 Column1, Column2 FROM TableName WHERE Condition ORDER BY Column1 DESC
         //       </example>

        private string GetSQLPrompt(string contextoSchema, string inputPesquisa)
        {
            string sqlStructure = @$" 
               
                {contextoSchema}
         
                <task>
                {inputPesquisa}
                </task>

               

                <constraints>
                    FOR SQL Server Database
                    Generate a SQL query using the T-SQL dialect for Microsoft SQL Server 2022
                    Use standard T-SQL formatting
                    T-SQL LANGUAGE
                    REMOVE COMMENTS
                    JUST SQL SELECT COMMAND
                    NOT USE UPDATE, DELETE, CREATE
                    Do not use LIMIT. Use TOP N syntax instead, as required by SQL Server.
                    Do not use LIMIT or OFFSET OR ROW_NUMBER
                    Do not use DROP TABLE or temporary tables
                    Use SQL Server syntax: place TOP N immediately after SELECT
                    Do not place TOP N at the end of the query
                    Do not generate multiple SELECT statements.
                    Do not use EXTRACT(). Use MONTH() and YEAR() functions for date filtering, as required in SQL Server T-SQL.
                    Always qualify all column names with their table name or alias (e.g., TableName.ColumnName).
                    
                    
                    
                </constraints>

                <verification>
                    Ensure that the join key fields (relation fields) in the tables always have the same name, beginning with the prefix 'NRSEQ'
                </verification>
            
            ";

            return sqlStructure;
        }

        public string GetFinalPrompt(string json, string inputGrafico)
        {
            string pesquisa2 = $@"You are a language model specialized in generating charts using HTML and JavaScript. 
            I will now provide you with a description of the chart I need. Your task is to generate only the HTML and JavaScript code required to create the chart, 
            with no explanations or comments..

                **Here is the chart description:**
            with this data {json} generate the HTML and JavaScript code for this specification {inputGrafico} **Only the HTML and JavaScript code **, with no explanations or any additional content.
            Use Chart.js to generate the chart. The chart must be displayed in a <canvas> with the ID myChart.";

            return pesquisa2;
        }

        public string ExtrairConsultaDosDados(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            // Expressão regular para capturar o conteúdo entre "Consulta dos dados:" e o próximo marcador ou fim do texto
            var match = Regex.Match(input, @"O que será exibido no gráfico:\s*\{([^}]*)\}", RegexOptions.IgnoreCase);

            if (match.Success)
            {
                return match.Groups[1].Value.Trim();
            }

            return string.Empty;
        }

       

        public async Task<string> RenderGraph(int idGrafico,string input, int idcontexto)
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(10));

            string inputGrafico = ""; 
            string inputPesquisa = ""; 
            
           
            inputPesquisa = ExtrairConsultaDosDados(input);
            inputGrafico = input;
           

            string contextoSchema = "";

            if (idcontexto == 1)//financeiro
                contextoSchema = GetContextoFinanceiro();
            else if (idcontexto == 2)//abastecimento
                contextoSchema = GetContextoAbastecimento();


            string sqlStructure = GetSQLPrompt(contextoSchema, inputPesquisa);


            bool executouConsulta = false;
            DataSet data = new DataSet();

            int cont = 0;
            string sql = "";
            string resultSql = "";
            while (!executouConsulta && cont<5)
            {
                try
                {
                    var result = await _kernel.InvokePromptAsync(sqlStructure);
                    resultSql= result.ToString();
                    sql = ExtractSql(resultSql);

                    data =  abastecimentoDAL.executeSQL(sql);
                    executouConsulta = true;
                }
                catch
                {
                    cont++;
                    executouConsulta = false;
                }
            }

           
            string json = DataSetToJson(data);


            string pesquisa2 = GetFinalPrompt(json,inputGrafico);

            var result2 = await _kernel.InvokePromptAsync(pesquisa2);

            string resultHtml = result2.ToString();
            string html = ExtracHtml(resultHtml);

           


            dashboardUsuarioIABLL.Save(new DTO.IA.DashboardIAUsuarioDTO()
            {
                IdGrafico = idGrafico,
                IdContexto=idcontexto,
                NrSeqUsuario = session.NrSeqUsuario,
                NoHtmlPrevia = html,
                NoSqlPrevia = resultSql,
                NoPromptPrevia=input
            });


            return html;

        }


        public class LoadDashboardInput 
        {
            public int NrSeqUsuario { get; set; }
        }

        public class LoadDashboardGraph
        {
            public int? IdGrafico { get; set; }
            public int IdContexto { get; set; }
            public string NoPrompt { get; set; }
            public string NoHtml { get; set; }
        }

        public class LoadDashboardOutput
        {
            public List<LoadDashboardGraph> Graficos { get; set; }
        }

        public LoadDashboardOutput LoadDashboard()
        {
        
            List<DashboardIAUsuarioDTO> listDashboardUsuario = dashboardUsuarioIABLL.Search(new DashboardIAUsuarioDTO { NrSeqUsuario=session.NrSeqUsuario});

            List<LoadDashboardGraph> listDashboardsOutput = new List<LoadDashboardGraph>();
            foreach (DashboardIAUsuarioDTO dash in listDashboardUsuario)
            {
                listDashboardsOutput.Add(new LoadDashboardGraph()
                {
                    IdGrafico = dash.IdGrafico,
                    IdContexto = dash.IdContexto,
                    NoHtml = ExtracHtml(dash.NoHtml),
                    NoPrompt = dash.NoPrompt
                });
            }

            LoadDashboardOutput dashboardOutput = new LoadDashboardOutput();
            dashboardOutput.Graficos = listDashboardsOutput;

            return dashboardOutput;
        }
    }
}
