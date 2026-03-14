resource "github_repository" "site" {
  name                                    = var.github_repository
  visibility                              = "public"
  has_downloads                           = true
  has_issues                              = true
  has_projects                            = true
  has_wiki                                = true
  ignore_vulnerability_alerts_during_read = false

  pages {
    cname      = var.pages_cname
    build_type = var.pages_build_type
  }
}
