#include <stdio.h>
#include <stdlib.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>

#include "defs.h"
#include "lcd.h"
#include "uart.h"

void ini_uart(){
	int fd_serie, indx = 0, current = 0, limit = 2;
	fd_serie = config_serial( "/dev/ttyS0", B9600 );
	printf("serial abierto con descriptor: %d\n", fd_serie);
	char * text = (char*)malloc(50 * sizeof(char));
	char * name = (char*)malloc(50 * sizeof(char));
	char * pass = (char*)malloc(50 * sizeof(char));
	char * ssid = (char*)malloc(50 * sizeof(char));
	char * psk = (char*)malloc(50 * sizeof(char));
	unsigned char dato = 0;

	char buffer[2];
	int type = 0;
	read(fd_serie, &buffer, 2);
	printf("%s\n", buffer);
	type = atoi(buffer);
	printf("tipo: %d\n", type);
	if(type == 3)
		limit =  4;
	printf("limite: %d\n", limit);
	while(indx < limit)
	{
		fflush(stdout);
		read( fd_serie, &dato, 1 );
		printf("%c", dato );
		if(dato == '\n'){
			text[ current ] = '\0';
			++indx;
			printf("dato: %s\n", text);
			current = 0;
			if(indx == 1 && (type == 2 || type == 3))
				strcpy(name,text);
			else if(indx == 2 && (type == 2 || type == 3))
				strcpy(pass,text);
			else if((indx == 1 && type == 1) || (indx == 3 && type == 3))
				strcpy(ssid,text);
			else if((indx == 2 && type == 1) || (indx == 4 && type == 3))
				strcpy(psk,text);
		}
		else{
			text[ current++ ] = dato;
		}

	}
	printf("Sale\n");
	close( fd_serie );
	free(text);
	if((type == 2 || type == 3) && !limit_reached())
		printf("Agregar usuario\n");
		// set_user(name, pass);
	free(name);
	free(pass);
	if(type == 1 || type == 3)
		printf("agregar wifi\n");
		// set_wifi(ssid,psk);
	free(ssid);
	free(psk);
}

int config_serial( char *dispositivo_serial, speed_t baudios )
{
	struct termios newtermios;
  	int fd;

  	fd = open( dispositivo_serial, (O_RDWR | O_NOCTTY) & ~O_NONBLOCK );
	if( fd == -1 )
	{
		printf("Error al abrir el dispositivo tty \n");
		exit( EXIT_FAILURE );
  	}

	newtermios.c_cflag 	= CBAUD | CS8 | CLOCAL | CREAD;
  	newtermios.c_iflag 	= IGNPAR;
  	newtermios.c_oflag	= 0;
  	newtermios.c_lflag 	= TCIOFLUSH | ~ICANON;
  	newtermios.c_cc[VMIN]	= 1;
  	newtermios.c_cc[VTIME]	= 0;

  	if( cfsetospeed( &newtermios, baudios ) == -1 )
	{
		printf("Error al establecer velocidad de salida \n");
		exit( EXIT_FAILURE );
  	}
	if( cfsetispeed( &newtermios, baudios ) == -1 )
	{
		printf("Error al establecer velocidad de entrada \n" );
		exit( EXIT_FAILURE );
	}
	if( tcflush( fd, TCIFLUSH ) == -1 )
	{
		printf("Error al limpiar el buffer de entrada \n" );
		exit( EXIT_FAILURE );
	}
	if( tcflush( fd, TCOFLUSH ) == -1 )
	{
		printf("Error al limpiar el buffer de salida \n" );
		exit( EXIT_FAILURE );
	}

	if( tcsetattr( fd, TCSANOW, &newtermios ) == -1 )
	{
		printf("Error al establecer los parametros de la terminal \n" );
		exit( EXIT_FAILURE );
	}
	return fd;
}

void set_user( char *name, char* pass ){
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

void set_wifi( char *ssid, char* psk ){
	printf("iniciando\n");
	char * ini_info = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\nupdate_config=1\ncountry=MX\n";
	char network[300]; 
	char ssid_get[50]; 
	char psk_get[50];
	char aux;
	char word[250];
	int indx = 0, type= 0, found = 0, keep = 1; //check_type 0=ssid 1=psk
	FILE * fd_suplicant, *fd_aux; //user_file
	fd_suplicant = fopen("/etc/wpa_supplicant/wpa_supplicant.conf", "r");
	if(fd_suplicant != NULL){
		while(keep){
			aux = fgetc(fd_suplicant);
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
		fd_suplicant = fopen("/etc/wpa_supplicant/wpa_supplicant.conf", "w");
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
		system("wpa_cli -i wlan0 reconfigure");
	}
	else{
		printf("Archivo no encontrado!!!!\n");
		fclose(fd_suplicant);
	}
}

int limit_reached(){
	FILE * fd;
	fd = fopen("users.txt","r");
	int keep = 1, count =0;
	char aux;
	while( keep ){
		aux = fgetc(fd);
		if(aux == '\n')
			++count;
		if(feof(fd))
			keep = 0;
	}
	fclose(fd);
	if(count == MAX_USERS)
		return 1;
	return 0;
}