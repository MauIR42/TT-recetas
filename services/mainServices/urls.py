from django.urls import path

from . import views

urlpatterns = [
	path('user', views.UserView.as_view(), name='userview'),
	path('user/recovery', views.passwordView.as_view(), name='passwordView'),
	path('auth', views.AuthUserView.as_view(), name='AuthUserView'),
	path('user/health', views.UserStatView.as_view(), name='UserStatView'),
]