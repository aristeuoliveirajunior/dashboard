using CSDModulos.DTO.Util;

namespace CSDModulos.DTO.IA
{
    public class DashboardIAUsuarioDTO : DTOBase
    {
        public int NrSeqDashboardIAUsuario { get; set; }
        public int IdContexto { get; set; }
        public int? IdGrafico { get; set; }
        public int? NrSeqUsuario { get; set; }
        public string NoPrompt { get; set; }
        public string NoSql { get; set; }
        public string NoHtml { get; set; }
        public string NoSqlPrevia { get; set; }
        public string NoHtmlPrevia { get; set; }
        public string NoPromptPrevia { get; set; }
    }
}
