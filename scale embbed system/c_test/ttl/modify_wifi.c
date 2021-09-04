#include <stdio.h>
#include <stdlib.h>
//#include <pthread.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>


int main(){
	printf("iniciando\n");
	char * ini_info = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\nupdate_config=1\ncountry=MX\n";
	char network[300]; 
	char *ssid ="romeroPonce-5G";
	char *psk = "GRCPIRARGRMR/1990+42Nuevo";
	char ssid_get[50]; 
	char psk_get[50];
	char aux;
	char word[250];
	int indx = 0, type= 0, found = 0, keep = 1; //check_type 0=ssid 1=psk
	// sprintf(user_name,"user_name=%s\n",name);
	// sprintf(password,"password=%s\n",pass);
	FILE * fd_suplicant, *fd_aux; //user_file
	fd_suplicant = fopen("wifi.txt", "r");
	printf("%d\n", found);
	while(keep){
		aux = fgetc(fd_suplicant);
		// printf("%c", aux);
		if(!found && aux == '=' ){
			word[indx] = '\0';
			printf("%s\n", word);
			if(!type && (!strcmp("ssid",word))){
				printf("Escribir nuevo ssid\n");
				found = 1;
				type = 1;
			}
			else if(type && (!strcmp("psk",word))){
				printf("Escribir nuevo psk\n");
				found = 1;
				type = 0;
			}
			indx = 0;
		}
		else if(found && aux == '\n'){
			word[ indx ] = '\0';
			if(!strcmp(ssid,word)){ //same as sended by user
				type = 0;
			}
			else{
				word[ indx ] = '\n';
				word[ indx + 1 ] = '\0';
				printf("Escribiendo %s\n", word);
				fd_aux = fopen("aux.txt", "a");
				fputs(word,fd_aux);
				fclose(fd_aux);
			}
			found = 0;
			indx = 0;
		}
		if(aux != '\"' && aux !='\n' && aux != '=' && aux != '\t' && aux !=' ' && aux != '{' && aux != '}')
			word[indx++] = aux;
		if(feof(fd_suplicant))
			keep = 0;
	}
	fclose(fd_suplicant);
	fd_suplicant = fopen("wifi.txt", "w");
	fd_aux = fopen("aux.txt", "r");
	keep = 1;
	fputs(ini_info, fd_suplicant);

	sprintf(network,"\nnetwork={\n        ssid=\"%s\"\n        psk=\"%s\"\n        key_mgmt=WPA-PSK\n}\n", ssid, psk);
	fputs(network, fd_suplicant);
	while(keep){
		if(fgets(ssid_get, 50, fd_aux) != NULL && fgets(psk_get, 50, fd_aux) != NULL){
			ssid_get[strlen(ssid_get) -1 ] = '\0';
			psk_get[strlen(psk_get) -1 ] = '\0';
			printf("%s\n", ssid_get);
			printf("%s\n", psk_get);
			sprintf(network,"\nnetwork={\n        ssid=\"%s\"\n        psk=\"%s\"\n        key_mgmt=WPA-PSK\n}\n", ssid_get, psk_get);
			fputs(network, fd_suplicant);
		}
		if(feof(fd_aux))
			keep = 0;
	}
	fclose(fd_aux);

	fclose(fd_suplicant);
	remove("aux.txt");

}