from django.urls import path

from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('user', views.UserView.as_view(), name='userview'),
]