
using CSDFramework.Extensions;

using CSDModulos.BLL.IA;
using CSDModulos.BLL.IA.Models;
using CSDModulos.BLL.SEG;

using CSDModulos.DTO.Util;
using CSDWebAPI30.Util;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;

using System;

using System.Threading;
using System.Threading.Tasks;
using static CSDModulos.BLL.IA.DashboardIABLL;

namespace CSDWebAPI30.Controllers.HELP
{
    [Authorize(AuthenticationSchemes = "CookieAuthentication")]
    [Route("IA/[controller]")]
    public class DashboardController : CSDControllerBase
    {
        private IWebHostEnvironment _enviroment;
        private IConfiguration _configuration;
        private readonly Kernel _kernel;
        private readonly ProfissaoBLL _profissaoBLL;
        private readonly DashboardIABLL _dashbboardIABLL;

        public DashboardController(IWebHostEnvironment enviroment, IMessaging messaging,ProfissaoBLL profissaoBLL, DashboardIABLL dashboarIABLL,IConfiguration configuration, Kernel kernel) : base(messaging, configuration, enviroment)
        {
            _enviroment = enviroment;
            _configuration = configuration;
            _kernel = kernel;
            _profissaoBLL = profissaoBLL;
            _dashbboardIABLL = dashboarIABLL;
        }










        [Authorize(AuthenticationSchemes = "CookieAuthentication")]
        [AllowAnonymous]
        [HttpPost("RenderGraph")]
        public async Task<IActionResult> RenderGraph([FromBody] ChatRequest input)
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(10)); // 5 minutos timeout

            string html = await _dashbboardIABLL.RenderGraph(input.IdGrafico,input.NoPrompt, input.IdContexto);

            if (html != "")
                return FormatResult(CSDResponseStatus.Success, "Registro salvo com sucesso.", html);
            else
                return FormatResult(CSDResponseStatus.Error, "Não foi possível salvar a Cfo.");

        }



        [HttpGet("LoadDashboard")]
        public IActionResult LoadDashboard()
        {
            try
            {
                LoadDashboardOutput data = _dashbboardIABLL.LoadDashboard();

                return FormatResult(CSDResponseStatus.Success, "", data);
            }
            catch (CSDException ex) { return FormatResult(CSDResponseStatus.Error, ex.Message); }
            catch (Exception ex)
            {
                Log(ex);
                return FormatResult(CSDResponseStatus.Error, "Erro desconhecido carregar o dashboard.");
            }
        }


    }
}