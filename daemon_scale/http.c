#define _XOPEN_SOURCE 500
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <errno.h>
#include <ftw.h>

#include "defs.h"
#include "user.h"
#include "http.h"
#include "lcd.h"

extern char * current_user;
extern int user_id;
extern char * access_code;
char * ip= "192.168.100.44";
int puerto = 8000;

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

	// printf("Creando Socket ....\n");
	if( (sockfd = socket (AF_INET, SOCK_STREAM, 0)) < 0 )
	{
		perror("Ocurrio un problema en la creacion del socket");
		exit(1);
	}

	// printf ("Estableciendo conexion ...\n");
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

	// printf("conexión creada\n");

	return sockfd;
}

int send_petition(int sockfd, char * petition){
	// printf ("Enviando mensaje al servidor ...\n");
	if( write(sockfd, petition, sizeof(char)*strlen(petition)) < 0 )
	{
		perror("Ocurrio un problema en el envio de un mensaje al cliente");
		return 0;
	}else
	// printf("Termina bien\n");
	return 1;
}

void send_post(struct datos * time, int weight, int id, char* ingredient, int check){
	char * petition_complete = format_post_request("/services/scale/stock", time, weight, id);
	char * response;
	char * path = (char*)malloc(100 * sizeof(char));
	int delete_pending = 0;

	int sockfd = connect_to_server(ip, puerto);

	if( check_connection(sockfd) == 1){
		if(send_petition(sockfd, petition_complete)){
			response = read_response(sockfd);
			// printf("response: %s\n", response);
			delete_pending = check_response( response );
			if(delete_pending == 1 && check){
				sprintf(path,"%s/pendientes.txt",current_user);
				// printf("a eliminar el pendiente %s, %s", path, ingredient);
				copy_except(path,ingredient);
			}
		}
		free(petition_complete);
		close(sockfd);
	}

}

void send_get(){

	char * petition_complete = format_get_request("/services/scale/update");
	char * response;

	int sockfd = connect_to_server(ip, puerto);

	if( check_connection(sockfd) == 1){
		if(send_petition(sockfd, petition_complete)){
			response = read_response(sockfd);
			check_response( response );
		}
		close(sockfd);
	}


}

void send_put(){
	char * petition_complete = format_put_request("/services/scale/update");
	// printf("peticion: %s\n", petition_complete);
	char * response;

	int sockfd = connect_to_server(ip, puerto);

	if(check_connection(sockfd) == 1){

		if(send_petition(sockfd, petition_complete)){
			// printf("Recibir datos\n");
			response = read_response(sockfd);
			// printf("respuesta: %s\n", response);
			// printf("Enviar datos\n");
			check_response( response );
			// printf("Finalizar datos\n");
		}
		// printf("Información enviada.\n");
		close(sockfd);
	}

}

char * read_response(int sockfd){
	char response[51];
	// char complete[300]="";
	char * complete = (char*)malloc(1000 * sizeof(char));
	char column_name[40], next_c = '\r', previous = '\n', aux_char;
	int n, aux, aux2 = 0, next = 0; //cont is just for testing
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
					// printf("%d : %s\n", cont++,column_name);
					if(next){
						c_l = atoi(column_name);
						// printf("El tamaño de cadena es : %d\n", c_l);
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
						// printf("Lo que sigue es el contenido:\n");
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
	// printf("%s\n", complete);
	// free(complete);
	return complete;
}


char * format_post_request(char * url, struct datos * data, int weight, int id){ //falta el scale_id y el current_user
	char  * petition_complete = (char*)malloc(500 * sizeof(char));
	char petition[] = "POST %s%s HTTP/1.0%s\r\n\r\n %s";
	char post_addition_bone[] = "\r\nContent-Length: %d\r\nContent-Type: application/json";
	char post_addition[60];
	char post_json_bone[] = "{\"time\" : \"%x:%x:%x_%x-%x-%x\", \"quantity\": %d, \"ingredient_id\": %d, \"access_code\": \"%s\", \"user_id\": \"%d\"}\0";
	char post_json[500];
	// printf("POST petition\n");
	sprintf(post_json, post_json_bone, data->horas, data->minutos, data->segundos,data->dia,data->mes,data->anio,weight,id,access_code,user_id);
	sprintf(post_addition,post_addition_bone, strlen(post_json) + 1 );
	sprintf(petition_complete, petition,url,"",post_addition,post_json );
	// printf("%s\n", petition_complete);

	return petition_complete;
}


char * format_get_request(char * url){
	char * petition_complete = (char*)malloc(150 * sizeof(char));

	char petition[] = "GET %s%s HTTP/1.0%s\r\n\r\n %s";

	char get_params_bone[] = "?access_code=%s";
	char get_params[20];

	// printf("GET petition\n");
	sprintf(get_params,get_params_bone, access_code);
	sprintf(petition_complete, petition,url,get_params,"","");

	// printf("%s\n", petition_complete);

	return petition_complete;



}

char * format_put_request(char * url){
	char * petition_complete = (char*)malloc(150 * sizeof(char));

	char petition[] = "PUT %s%s HTTP/1.0%s\r\n\r\n %s";
	char put_addition_bone[] = "\r\nContent-Length: %d\r\nContent-Type: application/json";
	char put_addition[50];
	char put_json_bone[] = "{ \"access_code\":\"%s\", \"reset\":true }";
	char put_json[150];
	sprintf(put_json, put_json_bone, access_code);
	sprintf(put_addition,put_addition_bone, strlen(put_json) + 1 );
	sprintf(petition_complete, petition,url,"",put_addition,put_json );

	return petition_complete;
}

char * hostname_to_ip(char * hostname )
{
	struct hostent *he; //estructura hostent representa una entrada de host 
	char * IP;
		
	if ( (he = gethostbyname( hostname ) ) == NULL) 
	{
		// printf("Error al obtener la estructura hostent\n");
		exit(0);
	}
	IP = inet_ntoa(*((struct in_addr*) 	// estructura in_addr estrcutura extraña que al menos contiene sin_addr que es la dirección ip
                           he->h_addr_list[0]));  //h_addr_list lista que en la posición 0 tiene la dirección IP 
                           //inet_ntoa convierte los bytes a una direccion IPV4 en notacion de números y puntos	
	return IP;
}

int check_response( char * response){
	// printf("%s\n", response);
	int n, aux, aux2 = 0, key_found = 0, restart_complete = 0, comillas = 0; //cont is just for testing //found encontro una llave
	char * complete = (char*)malloc(1000 * sizeof(char));
	char * key = (char*)malloc(1000 * sizeof(char));
	aux = 0;
	n = strlen(response);
	while(aux!= n){

		if( response[aux] == ':'){
			key_found = 1;
			complete[aux2] = '\0';
			strcpy(key, complete);
			restart_complete = 1;
		}else if( (!key_found) && (response[aux] != '{' && response[aux] != ' ' && response[aux] != '"') )
			complete[aux2++] = response[aux];
		else if(key_found){

			if( strcmp("error",key) == 0){
				if(response[aux] != ' ' && response[aux] != ',')
					complete[aux2++] = response[aux];
				else if(response[aux] == ','){
					complete[aux2] = '\0';

					if( strcmp("true", complete) == 0){
						// printf("Hubo un error, terminando programa\n");
						return -1;
					}
					// else
						// printf("Sin error\n");
					key_found = 0;
					restart_complete = 1;
				}
			}else if( strcmp("scale#delete",key) == 0){
				if( comillas == 2){
					complete[aux2] = '\0';
					delete_users(complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if(response[aux] != ' ' && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){

					comillas++;
				}
			}else if( strcmp("scale#add",key) == 0){
				if( comillas == 2){
					complete[aux2] = '\0';

					add_users(complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if( ( (comillas == 1 && response[aux] == ' ') || response[aux] != ' ') && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){

					comillas++;
				}
			}else if( strcmp("scale#ingredients",key) == 0){
				if( comillas == 2){
					complete[aux2] = '\0';

					update_pending(complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if( ( (comillas == 1 && response[aux] == ' ') || response[aux] != ' ') && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){

					comillas++;
				}
			}else if( strcmp("pending",key) == 0){
				if(response[aux] != ' ' && response[aux] != ',' && response[aux] != '}')
					complete[aux2++] = response[aux];
				else if(response[aux] == '}'){
					complete[aux2] = '\0';
					if( strcmp("true", complete) == 0)
						return 0;
					else
						return 1;
					key_found = 0;
					restart_complete = 1;
				}
			}else if( strcmp("reset",key) == 0){
				if(response[aux] != ' ' && response[aux] != ',' && response[aux] != '}')
					complete[aux2++] = response[aux];
				else if(response[aux] == '}'){
					// printf("revisando si hay que reiniciar\n");
					complete[aux2] = '\0';
					if( strcmp("true", complete) == 0)
						restart_scale();
					key_found = 0;
					restart_complete = 1;
				}
			}
		}

		if(restart_complete){
			restart_complete = 0;
			complete[0] = '\0';
			aux2 = 0;
		}
		aux++;

	}
	free(key);
	free(complete);
	return 0;
}

void delete_users( char *  users){
	// printf("borrar usuarios\n");
	char * token = strtok(users, ",");
	while( token != NULL ) {
	  // printf( "token: %s\n", token ); //printing each token
	  delete_user(token);
	  token = strtok(NULL, ",");
	}
	// delete_user(token);
}

void add_users( char *  users){
	// printf("agregar usuarios\n");
	char * token = strtok(users, " ");
	while( token != NULL ) {
	  // printf( "token_add: %s\n", token ); //printing each token
	  add_user(token);
	  token = strtok(NULL, " ");
	}
	// delete_user(token);
}

void update_pending( char * pending){

	// printf("actualizar usuarios\n");
	char * user = strtok(pending, ";");
	char * elements = strtok(NULL, ";");
	while( user != NULL && elements != NULL) {
	  // printf( "user: %s\n", user ); //printing each token
	  // printf( "elements: %s\n", elements ); //printing each token
	  update_user_pending(user,elements);
	  user = strtok(NULL, ";");
	  elements = strtok(NULL, ";");

	}

}

int check_connection(int sockfd){
	if(sockfd == -1){
		clear_display();
		writeWord("Error de conexion\nen su internet.");
		// printf("No hay conexion a internet\n");
		sleep(2);
		return -1;
	}
	else if(sockfd == -2){
		clear_display();
		writeWord("Error externo\nReintente despues");
		// printf("no se pudo conectar con el servidor\n");
		sleep(2);
		return -1;
	}
	else if(sockfd == -3){
		clear_display();
		writeWord("Error externo\nReintente despues");
		// printf("El servidor tardo en responder no se pudo conectar con el servidor\n");
		sleep(2);
		return -1;
	}

	return 1;
}