import importlib.util
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class SomnologyBuildTests(unittest.TestCase):
    def test_build_resolves_all_includes(self):
        spec = importlib.util.spec_from_file_location("somnology_build", ROOT / "build.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        source = module.TEMPLATE_FILE.read_text(encoding="utf-8")
        result = module.resolve_includes(source, module.SRC_DIR)
        self.assertNotIn("<!-- INCLUDE", result)
        self.assertIn('id="sleep_diary_body"', result)
        self.assertIn("ROUTER_RULES", result)

    def test_referenced_ids_exist(self):
        sections = "\n".join(path.read_text(encoding="utf-8") for path in (ROOT / "src" / "sections").glob("*.html"))
        app = (ROOT / "src" / "js" / "app.js").read_text(encoding="utf-8")
        html_ids = set(re.findall(r'id="([^"]+)"', sections))
        required = {"age", "sex", "complaint_duration", "complaint_frequency", "sleep_opportunity", "sleep_conditions", "waso", "time_in_bed", "sleep_diary_body", "sleep_diary_summary"}
        self.assertTrue(required <= html_ids)
        for field_id in required:
            self.assertIn(field_id, app)
        all_ids = re.findall(r'id="([^"]+)"', sections)
        self.assertEqual(len(all_ids), len(set(all_ids)), "HTML id должны быть уникальны")

    def test_router_is_non_mutating_until_explicit_action(self):
        app = (ROOT / "src" / "js" / "app.js").read_text(encoding="utf-8")
        run_body = app.split("function runAdvisor()", 1)[1].split("function listHtml", 1)[0]
        self.assertNotIn("applyTestsForDiagnosis", run_body)
        self.assertNotIn("applyRecommendationsForDiagnosis", run_body)
        self.assertIn("function applyRouterPlan", app)

    def test_medication_groups_and_diary_appendix_are_present(self):
        app = (ROOT / "src" / "js" / "app.js").read_text(encoding="utf-8")
        self.assertIn("const MEDICATION_GROUPS", app)
        self.assertIn("β-блокаторы", app)
        self.assertIn("function sleepDiaryAppendix", app)
        self.assertIn("item.id === 'sleep_diary'", app)

    def test_form_fields_are_collected_and_reported(self):
        app = (ROOT / "src" / "js" / "app.js").read_text(encoding="utf-8")
        form_html = "\n".join((ROOT / "src" / "sections" / name).read_text(encoding="utf-8") for name in ("general.html", "sleep.html", "diagnosis.html", "plan.html"))
        field_ids = set(re.findall(r'<(?:input|select|textarea)[^>]*\bid="([^"]+)"', form_html))
        collect_block = app.split("function collectState()", 1)[1].split("function classifyIsi", 1)[0]
        indirect_or_ui = {"diagnosis_search", "diagnosis_manual", "comorbidity_extra", "substances_extra", "recommendations_extra", "tests_extra"}
        missing = sorted(field_id for field_id in field_ids - indirect_or_ui if f"'{field_id}'" not in collect_block and f'"{field_id}"' not in collect_block)
        self.assertEqual(missing, [], f"Поля не собираются в collectState: {missing}")

        report_block = app.split("function generateReport()", 1)[1].split("async function copyReport", 1)[0]
        required_report_keys = {
            "eveningSleepiness", "latency", "awakenings", "waso", "circadianPattern", "preferredBedtime",
            "preferredWaketime", "freeScheduleSleep", "morningLightMinutes", "episodeTiming", "episodeOnsetAge"
        }
        absent = sorted(key for key in required_report_keys if f"s.{key}" not in report_block)
        self.assertEqual(absent, [], f"Поля не попадают в заключение: {absent}")


if __name__ == "__main__":
    unittest.main()
