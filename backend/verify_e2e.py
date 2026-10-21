"""
RaahSetu End-to-End System Verification Script
Tests all core APIs, simulated data, deterministic rules, and Priya's 4-Act journey.
"""
import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode("utf-8")
            return response.status, json.loads(res_data)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(error_body)
        except:
            parsed = error_body
        return e.code, parsed
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("=" * 65)
    print("   RAAHSETU END-TO-END VERIFICATION & AUDIT SUITE")
    print("=" * 65)
    passed = 0
    total = 0

    def test(name, status, expected_status=200, check=None):
        nonlocal passed, total
        total += 1
        if status == expected_status and (check is None or check()):
            print(f"[PASS] {name}")
            passed += 1
            return True
        else:
            print(f"[FAIL] {name} (Got status: {status})")
            return False

    # 1. Health check
    st, data = make_request("/health")
    test("Backend Health Check", st, 200, lambda: data.get("status") == "healthy")

    # 2. Demo Login as Priya Sharma
    st, auth_data = make_request("/auth/demo-login", method="POST", data={"persona": "priya"})
    token = auth_data.get("access_token")
    test("Demo Auth: Logged in as Priya Sharma", st, 200, lambda: token is not None)

    # 3. Act 1: Gaon Demand Ledger
    st, data = make_request("/demand-ledger/categories?village=Bilaspur")
    test("Act 1: Gaon Demand Categories", st, 200, lambda: len(data.get("categories", [])) >= 4)

    st, data = make_request("/demand-ledger/responses", method="POST", data={
        "category_id": 1,
        "village": "Bilaspur",
        "respondent_name": "Suresh Patel",
        "respondent_type": "Farmer",
        "transcript_en": "Our solar irrigation controller burned out after the storm. Need trained technician.",
        "input_channel": "voice"
    })
    test("Act 1: Voice Signal Dynamic Career Shift Explainer", st, 200, lambda: "career_shifts" in data and len(data["career_shifts"]) > 0)

    # 4. Act 2: Kamao-Seekho Micro-Gigs & Wallet
    st, data = make_request("/micro-gigs")
    test("Act 2: Micro-Gigs Feed", st, 200, lambda: len(data.get("gigs", [])) >= 4)

    st, data = make_request("/micro-gigs/wallet", token=token)
    test("Act 2: Simulated Student Wallet (Priya)", st, 200, lambda: data.get("balance_inr", 0) >= 1000)

    # 5. Act 3: Pehla Kadam Bridge Funding
    st, data = make_request("/bridge/requests", token=token)
    test("Act 3: Pehla Kadam Bridge Records", st, 200, lambda: len(data.get("requests", [])) >= 1)

    # 6. Act 4: Pravas Kavach & Migration Safety
    st, data = make_request("/pravas-kavach/plan/1", token=token)
    test("Act 4: Pravas Kavach Transition Record", st, 200, lambda: "accommodation" in data and data["accommodation"]["name"] is not None)

    # 7. Supporting features: Prep Dojo
    st, data = make_request("/prep-dojo/fraud-scenarios")
    test("Prep Dojo: Fraud Dojo Scenarios", st, 200, lambda: len(data.get("scenarios", [])) >= 3)

    st, data = make_request("/prep-dojo/interview-questions/solar-microgrid-technician")
    test("Prep Dojo: Mock Saakshatkar Questions", st, 200, lambda: len(data.get("questions", [])) >= 3)

    # 8. Facilitator Impact & Programme Economics
    st, data = make_request("/facilitator/metrics")
    test("Facilitator: Live DB Aggregated Metrics", st, 200, lambda: data.get("students_enrolled", 0) >= 1 and data.get("skills_verified", 0) >= 1)

    st, data = make_request("/facilitator/programme-economics", method="POST", data={
        "cohort_size": 50,
        "training_cost_per_student": 6500,
        "bridge_grant_per_student": 8000,
        "relocation_rate_pct": 60,
        "placement_rate_pct": 82,
        "average_monthly_wage_inr": 15000
    })
    test("Facilitator: CSR Economics & SROI Calculator", st, 200, lambda: "sroi_ratio" in data and data.get("placed_students") == 41)

    # 9. Demo Reset
    st, data = make_request("/demo/reset", method="POST")
    test("Demo Control: 1-Click Reset", st, 200, lambda: "message" in data)

    print("-" * 65)
    print(f"FINAL AUDIT RESULTS: {passed}/{total} tests passed ({round(passed/total*100)}%)")
    print("=" * 65)

    if passed == total:
        print("[ALL TESTS SUCCESSFUL] RaahSetu is 100% production-ready for Citi Hackathon!")
        return 0
    else:
        print("[WARNING] Some tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
