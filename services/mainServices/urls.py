from django.urls import path

from . import views

urlpatterns = [
	path('user', views.UserView.as_view(), name='userview'),
	path('user/recovery', views.passwordView.as_view(), name='passwordView'),
	path('auth', views.AuthUserView.as_view(), name='AuthUserView'),
	path('user/health', views.UserStatView.as_view(), name='UserStatView'),
	path('scale', views.ScaleView.as_view(), name='ScaleView'),
	path('ingredient', views.IngredientView.as_view(), name='IngredientView'),
	path('stock', views.StockView.as_view(), name='StockView'),
	path('scale/update', views.EmbebbedScaleView.as_view(), name='EmbebbedScaleView'),
	path('scale/stock', views.EmbebbedScaleView.as_view(), name='EmbebbedScaleView'),
	path('test_sed', views.TestSED.as_view(), name="TestSED"),
	path('planning', views.PlanningView.as_view(), name="PlanningView"),
	path('recipe_evaluation', views.RecipeEvaluationView.as_view(), name="RecipeEvaluationView"),
	path('recommendation', views.RecommendationView.as_view(), name="RecommendationView"),
	path('recipe', views.RecipeView.as_view(), name="RecipeView"),
	path('stock/pending', views.PendingView.as_view(), name="PendingView"),

]