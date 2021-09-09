#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include<netdb.h>

#include "user.h"

void delete_users( char *  users);
void add_users( char *  users);
void update_pending( char *  pending);

int check_response( char * response);

int main(int argc, char **argv)
{
	//copy_file("lista.txt","test01/lista.txt");
	//test11,123 test12,489 test13,1001
	 char * response = "{\"error\": false, \"scale#delete\": \"\", \"scale#add\": \"test11,123 test12,489 test13,1001\", \"scale#ingredients\": \"\" }";
	// // char * response = "{\"error\": false, \"pending\": false}";
	 // char * last_user = "test01";
	 // char * ingredient_name = "sal";
	 // char path[30];
	 // int test = check_response( response);
	 check_response( response);
		// if( test ){
	// 	printf("hay que eliminar el dato\n");
	// 	sprintf(path,"%s/pendientes.txt",last_user);
	// 	printf("a modificar: %s, eliminar: %s\n",path,ingredient_name);
	// 	copy_except(path,ingredient_name);

	// }else{
	// 	printf("sigue, no pasa nada\n");
	// }


}

int check_response( char * response){
	
	// printf("%s\n", response);
	int n, aux, aux2 = 0, key_found = 0, restart_complete = 0, comillas = 0; //cont is just for testing //found encontro una llave
	char * complete = (char*)malloc(1000 * sizeof(char));
	char * key = (char*)malloc(1000 * sizeof(char));
	aux = 0;
	n = strlen(response);
	while(aux!= n){
		// printf("%c",response[aux]);
		if( response[aux] == ':'){
			key_found = 1;
			complete[aux2] = '\0';
			strcpy(key, complete);
			restart_complete = 1;
			// printf("llave: %s\n", key);
		}else if( (!key_found) && (response[aux] != '{' && response[aux] != ' ' && response[aux] != '"') )
			complete[aux2++] = response[aux];
		else if(key_found){

			if( strcmp("error",key) == 0){
				if(response[aux] != ' ' && response[aux] != ',')
					complete[aux2++] = response[aux];
				else if(response[aux] == ','){
					if( strcmp("true", complete) == 0){
						printf("Hubo un error, terminando programa\n");
						return -1;
					}
					// printf("Sin error\n");
					key_found = 0;
					restart_complete = 1;

					// break;
				}
			}else if( strcmp("scale#delete",key) == 0){
				// printf("Se ha encontrado el contenido a eliminar\n");
				// printf("texto: %c\n", response[aux]);
				// printf("%c",response[aux]);
				if( comillas == 2){
					complete[aux2] = '\0';
					// printf("Datos a eliminar: %s\n", complete);
					delete_users(complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if(response[aux] != ' ' && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){
					// printf("comillas\n");
					comillas++;
				}
			}else if( strcmp("scale#add",key) == 0){
				// printf("Se ha encontrado el contenido a agregar\n");
				if( comillas == 2){
					complete[aux2] = '\0';
					printf("Datos a agregar: %s\n", complete);
					add_users(complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if( ( (comillas == 1 && response[aux] == ' ') || response[aux] != ' ') && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){
					// printf("comillas\n");
					comillas++;
				}
			}else if( strcmp("scale#ingredients",key) == 0){
				// printf("Se ha encontrado el contenido a modificar en los ingredientes\n");
				if( comillas == 2){
					complete[aux2] = '\0';
					// printf("Datos a actualizar: %s\n", complete);
					update_pending(complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if( ( (comillas == 1 && response[aux] == ' ') || response[aux] != ' ') && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){
					// printf("comillas\n");
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

					// break;
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
	return 0;
}

void delete_users( char *  users){
	// printf("borrar usuarios\n");
	char * token = strtok(users, ",");
	while( token != NULL ) {
	  // printf( "token: %s\n", token ); //printing each token
	  delete_user(token);
	  token = strtok(NULL, " ");
	}
	// delete_user(token);
}

void add_users( char *  users){
	// printf("agregar usuarios\n");
	char * token = strtok(users, " ");
	while( token != NULL ) {
	  printf( "token_add: %s\n", token ); //printing each token
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
