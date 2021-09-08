#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <errno.h>

#include "defs.h"
#include "http.h"

int connect_to_server(char * ip, int puerto){
	int sockfd;
	struct sockaddr_in direccion_servidor;
	memset (&direccion_servidor, 0, sizeof (direccion_servidor));
	direccion_servidor.sin_family = AF_INET;
	direccion_servidor.sin_port = htons(puerto);
	if( inet_pton(AF_INET, ip, &direccion_servidor.sin_addr) <= 0 )
	{
		perror("Ocurrio un error al momento de asignar la direccion IP");
		exit(1);
	}

	printf("Creando Socket ....\n");
	if( (sockfd = socket (AF_INET, SOCK_STREAM, 0)) < 0 )
	{
		perror("Ocurrio un problema en la creacion del socket");
		exit(1);
	}

	printf ("Estableciendo conexion ...\n");
	if( connect(sockfd, (struct sockaddr *)&direccion_servidor, sizeof(direccion_servidor) ) < 0) 
	{
		perror ("Ocurrio un problema al establecer la conexion");
		if(errno == ENETUNREACH)
			return -1;
		else if(errno == ECONNREFUSED){
			return -2;
		}
		else if(errno == ETIMEDOUT){
			return -3;
		}
		// exit(1);
	}

	return sockfd;
}

void send_petition(int sockfd, char * petition){
	printf ("Enviando mensaje al servidor ...\n");
	if( write(sockfd, petition, sizeof(char)*strlen(petition)) < 0 )
	{
		perror("Ocurrio un problema en el envio de un mensaje al cliente");
		exit(1);
	}
}

void read_response(int sockfd){
	char response[51];
	// char complete[300]="";
	char * complete = (char*)malloc(1000 * sizeof(char));
	char column_name[40], next_c = '\r', previous = '\n', aux_char;
	int n, aux, aux2 = 0,cont = 0, next = 0; //cont is just for testing
	int add = 1, c_l = 0, returns = 0, content = 0;
	while ((n = read (sockfd, response, sizeof(char)*50)) > 0)
	{	
		response[n] = '\0';
		aux = 0;
		while(aux!= n){
			// printf("%c", response[aux] );
			if(content){
				// printf("obtener el content:\n");
				complete[aux2] = response[aux];
			}
			else{
				if(response[aux] != ' ' && response[aux] != '\n' && response[aux] != '\r'){
					column_name[aux2] = response[aux];
				}
				else{
					column_name[ aux2 ] = '\0';	
					printf("%d : %s\n", cont++,column_name);
					if(next){
						c_l = atoi(column_name);
						printf("El tamaño de cadena es : %d\n", c_l);
						next = 0;
						complete = (char*) realloc(complete, c_l + 1);
					}
					if(!strcmp("Content-Length:", column_name))
						next = 1;
					strcpy(column_name,"");
					if(response[aux] == next_c){
						returns++;
						aux_char = next_c;
						next_c = previous;
						previous = aux_char;
					}
					else
						returns = 0;
					if(returns == 4){
						printf("Lo que sigue es el contenido:\n");
						content = 1;
					}
					aux2 = 0;
					add = 0;
					// break;
				}
			}
			aux++;
			if(add)
				aux2++;
			else{
				add = 1;
			}
		}
		// break;
	}
	// strcat(complete,response);
	// printf("%s\n", response); //last piece of information
	printf("%s\n", complete);
	free(complete);
	return complete;
}


char * post_request(char * url, struct datos * data, int weight, int id){
	// char petition[] = "GET /scale/user_weight/?test=hola HTTP/1.0\r\n\r\n";
	static char petition_complete[150];
	printf("%d\n", sizeof(petition_complete));
	// char petition2[] = "POST /scale/user_weight/ HTTP/1.0\r\nContent-Length: %d\r\nContent-Type: application/json\r\n\r\n %s";
	// method (POST,GET) url(scale/{{rest_of_url}}) get_params(?test=hola) post_addition variable post_json_content ({'test':'123'})
	char petition[] = "POST %s%s HTTP/1.0%s\r\n\r\n %s";
	char post_addition_bone[] = "\r\nContent-Length: %d\r\nContent-Type: application/json";
	char post_addition[60];

	char post_json_bone[] = "{\"time\" : \"%x:%x:%x_%x-%x-%x\", \"weight\": %d, \"id\": %d}\0";
	char post_json[70];

	printf("POST petition\n");
	sprintf(post_json, post_json_bone, data->horas, data->minutos, data->segundos,data->dia,data->mes,data->anio,weight,id);
	sprintf(post_addition,post_addition_bone, sizeof(post_json));
	sprintf(petition_complete, petition,url,"",post_addition,post_json );
	printf("%s\n", petition_complete);

	return petition_complete;
}


char * get_request(char * url, char * access_code){
	static char petition_complete[150];
	printf("%d\n", sizeof(petition_complete));

	char petition[] = "GET %s%s HTTP/1.0%s\r\n\r\n %s";

	char get_params_bone[] = "?access_code=%s";
	char get_params[20];

	printf("GET petition\n");
	sprintf(get_params,get_params_bone, access_code);
	sprintf(petition_complete, petition,url,get_params,"","");

	printf("%s\n", petition_complete);

	return petition_complete;



}

void manage_get_response(char * response){
	//buscar error, add, delete, ingredients 
	// reglas:
	/*
		si hay "" significa que hay un valor dentro
		si hay
	*/
	while ((n = read (sockfd, response, sizeof(char)*50)) > 0){

	}
}

char * hostname_to_ip(char * hostname )
{
	struct hostent *he; //estructura hostent representa una entrada de host 
	char * IP;
		
	if ( (he = gethostbyname( hostname ) ) == NULL) 
	{
		printf("Error al obtener la estructura hostent\n");
		exit(0);
	}
	IP = inet_ntoa(*((struct in_addr*) 	// estructura in_addr estrcutura extraña que al menos contiene sin_addr que es la dirección ip
                           he->h_addr_list[0]));  //h_addr_list lista que en la posición 0 tiene la dirección IP 
                           //inet_ntoa convierte los bytes a una direccion IPV4 en notacion de números y puntos	
	return IP;
}