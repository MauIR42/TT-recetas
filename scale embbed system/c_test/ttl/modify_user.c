#include <stdio.h>
#include <stdlib.h>
//#include <pthread.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>


int main(){
	// char network[100] = "network={\nssid=\"%s\"\npsk=\"%s\"\nkey_mgmt=WPA-PSK\n}";
	char *name ="Pepe_1270";
	char *pass = "Pass123/";
	char user_name[50]; 
	char password[50];
	sprintf(user_name,"user_name=%s\n",name);
	sprintf(password,"password=%s\n",pass);
	FILE * fd_uf; //user_file
	fd_uf = fopen("user_info.txt", "w");
	fputs(user_name,fd_uf);
	fputs(password, fd_uf);
	fclose(fd_uf);
}