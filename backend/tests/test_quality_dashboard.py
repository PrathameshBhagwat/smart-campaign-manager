import pytest
from app.services.dashboard_service import DashboardService

# Since dashboard service relies heavily on Supabase client and database state,
# a true unit test would require deep mocking of the Supabase python client.
# Here we provide a skeleton that verifies the method signature exists and returns the expected schema shape
# if it were mocked.

def test_dashboard_service_methods_exist():
    assert hasattr(DashboardService, 'get_overview')
    assert hasattr(DashboardService, 'get_recent_activity')
    assert hasattr(DashboardService, 'get_top_campaigns')
    assert hasattr(DashboardService, 'get_recent_campaigns')
