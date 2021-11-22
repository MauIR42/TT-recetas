#define _XOPEN_SOURCE 500
#include <ftw.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

#include <sys/stat.h>
#include <sys/types.h>

#include "user.h"

int get_user_id(char * current_user){
	FILE * fd = fopen("/home/pi/Documents/TT/repository/users.txt", "r");
	char id[30];
	int aux, commas = 0, ignore = 0, index = 0, finish = 0;;

	while( (aux = fgetc(fd)) != EOF ){
		if( ignore ){
			if( aux == '\n')
				ignore = 0;
		}
		else if( aux == ','){
			commas++;
			if( commas == 1){
				id[ index ] = '\0';
				if( strcmp(id,current_user) != 0 ){
					commas = 0;
					ignore = 1;
					index = 0;
				}
			}
		}else if( commas == 2 ){
			index = 0;
			commas = 0;
			id[ index++ ] = aux; 
			finish = 1;
		}else if( aux != '\n' && aux != ',' ){
			if( finish )
				break;

			id[ index++ ] = aux; 		
		}
	}

	id[ index ] = '\0';
	return atoi( id );
}

char * get_first(char * file){
	FILE * fd;
	char text[16], *to_return;
	fd = fopen(file, "r");
	fgets(text,16,fd);
	// printf("%s\n", text);
	to_return = strdup(text);
	fclose(fd);
	return to_return;
}

char * get_until_delimiter(char * file, char delimiter){
	// printf("entra a la funcion\n");
	FILE * fd;
	char * result = (char*)malloc(20 * sizeof(char));
	int aux;
	int index = 0;
	fd = fopen(file, "r");
	aux = fgetc(fd);
	while( aux != EOF && aux != delimiter){
		result[index++] = aux;
		aux = fgetc(fd);

	}
	result[index] = '\0';
	fclose(fd);
	// printf("sale de la funcion\n");
	return result;

}

void set_last( char * new_last){
	FILE *fd = fopen("/home/pi/Documents/TT/repository/last.txt", "w");
	fputs(new_last,fd);
	fclose(fd);
}

void update_user_pending(char * user, char * pending){
	char path[90];
	int index = 0, total = strlen(pending), check_next = 0;
	sprintf(path,"/home/pi/Documents/TT/repository/%s/pendientes.txt", user);
	FILE *fd = fopen(path,"w");
	// printf("Agregando datos al usuario: %s\n", user);
	while( index != total ){

		if( check_next ){
			check_next = 0;
			fputc('\n', fd);
			// printf("\n");
		}
		if( pending[ index ] != '#' ){
			// printf("%c", pending[ index]);
			fputc(pending[ index ], fd);
		}else{
			check_next = 1;
		}

		index++;
	}
	// printf("\n");
	fclose(fd);

}

void add_user(char * user_path){
	// printf("agregando usuario: %s\n", user_path);
	char new_path[90];
	int i,index = 0;
	// printf("agregando a users.txt\n");
	add_at_end("/home/pi/Documents/TT/repository/users.txt",user_path);
	for(i = 0; i< strlen(user_path); i++){
		if(user_path[index] == ','){
			new_path[ index ] = '\0';
			break;
		}
		new_path[ index ] = user_path[ index ];
		index++;
	}
	// printf("creando carpeta\n");
	create_path(new_path);

	char file[] = "/home/pi/Documents/TT/repository/%s/lista.txt";
	char path_complete[90];
	sprintf(path_complete,file,new_path);
	// printf("copiando lista\n");
	copy_file("/home/pi/Documents/TT/repository/lista.txt",path_complete);

}

void add_at_end(char * file, char * user_path){
	FILE *fd = fopen(file, "r");
	int size = 0;
	if (NULL != fd) {
	    fseek (fd, 0, SEEK_END);
	    size = ftell(fd);
	}
	fclose(fd);
	fd = fopen(file, "a");
	if(0 != size)
		fputs("\n",fd);
	fputs(user_path,fd);
	fclose(fd);
}

void create_path(char * path){
	// printf("La carpeta a crear es: %s\n", path);
	char correct_path[90];
	sprintf(correct_path,"/home/pi/Documents/TT/repository/%s",path);
	struct stat st = {0};
	if (stat(correct_path, &st) == -1) {
    	if( 0 != mkdir(correct_path, 0777)){
    		// perror("mkdir");
    		exit(1);
    	}
	}
}

int copy_file(char* original, char * copy){
	// printf("Original: %s\n", original);
	// printf("copia: %s\n", copy);
	int aux;
	FILE *fo, *fc;
	fo = fopen(original, "r");
	if( fo == NULL){
		// printf("Error al abrir el archivo: %s\n", original);
		return -1;
	}

	fc = fopen(copy, "w");
	if( fc == NULL){
		// printf("Error al abrir el archivo: %s\n", copy);
		return -1;
	}

	aux = fgetc(fo);
	while(aux != EOF){
		// printf("%c", aux);
		fputc(aux,fc);
		aux = fgetc(fo);
	}

	fclose(fo);
	fclose(fc);
	return 0;
}


void delete_user(char * user_path){
	char real_path[90];
	sprintf(real_path,"/home/pi/Documents/TT/repository/%s",user_path);
	nftw(real_path, delete_file, 12, FTW_DEPTH | FTW_PHYS);
	// printf("El resultado de eliminar fue %d\n", result );
	copy_except("/home/pi/Documents/TT/repository/users.txt",user_path);

}


int delete_file(const char *f_path, const struct stat *sb, int typeflag, struct FTW *ftwbuf){
	int rf = remove(f_path); //file_path
	if(rf){
		exit(1);
		// perror("Error al intentar borrar el archivo");
		// perror(f_path);
	}
	return rf;
}

void restart_scale(){
	FILE *fd = fopen("/home/pi/Documents/TT/repository/users.txt","r");
	char user[21];
	char * username;
	char real_path[90];
	int res;
	while( fgets(user,21,fd) != NULL){
		// printf("El usuario completo: %s\n", user);
		 username = strtok(user, ",");
		 // printf("El nombre es: %s\n", username);
		 sprintf(real_path,"/home/pi/Documents/TT/repository/%s",username);
		 res = nftw(real_path, delete_file, 12, FTW_DEPTH | FTW_PHYS);
		 // printf("respuesta: %d\n", res);
	}
	fclose(fd);
	// printf("Eliminando archivo users.txt");
	fd = fopen("/home/pi/Documents/TT/repository/users.txt","w");
	fclose(fd);
	// printf("Eliminando archivo last.txt");
	fd = fopen("/home/pi/Documents/TT/repository/last.txt","w");
	fclose(fd);
}


void copy_except(char * file,char * except){
	// printf("A eliminar: %s\n", except);
	FILE * fd, * fd_aux;
	int keep = 1, cont_indx = 0, copy = 0, first = 1, added = 0, check_comma = 1;
	int aux;
	char container[40];
	fd = fopen(file,"r");
	while( keep ){
		aux = fgetc(fd);
		if(aux == EOF){
			// printf("final de archivo\n");
			break;
		}
		// printf("%c\n", aux);
		if( aux == ','){
			if( check_comma ){
				check_comma = 0;
				container[ cont_indx ] = '\0';
				// printf("a comparar: %s\n", container);
				if(strcmp(except,container) != 0){
					copy = 1;
					container[cont_indx++] = aux;
					continue;
				}else
					cont_indx = 0;
			}else{
				check_comma = 1;
				container[cont_indx++] = aux;
			}
		}
		else if( aux != '\n' && aux != '\0')
			container[cont_indx++] = aux;
		else if( aux == '\n' || aux == '\0' ){
			if(copy){
				copy = 0;
				added= 1;
				fd_aux = fopen("/home/pi/Documents/TT/repository/aux.txt", "a");
				aux = fgetc(fd);
				if(aux != EOF){
					if(first)
						first = 0;
					else
						fputs("\n",fd_aux);
				}

				container[ cont_indx ] = '\0';
				// printf("Escribiendo %s\n", container);
				fputs(container,fd_aux);
				fclose(fd_aux);
				cont_indx = 0;
				if(aux != EOF){
					container[cont_indx++] = aux;
				}
			}else
				cont_indx = 0;
		}
	}
	if(copy){
		// printf("otro copy \n");
		added= 1;
		container[ cont_indx] = '\0';
		// printf("Escribiendo: %s\n", container);
		fd_aux = fopen("/home/pi/Documents/TT/repository/aux.txt", "a");
		if(!first)
			fputs("\n",fd_aux);
		fputs(container,fd_aux);
		fclose(fd_aux);
	}

	// printf("Sale!\n");
	fclose(fd);
	if(added){
		remove(file);
		// printf("Elimina!\n");
		rename("/home/pi/Documents/TT/repository/aux.txt",file);
		// printf("Renombra!\n");
	}else{
		// printf("eliminar datos del archivo\n");
		fd_aux = fopen(file, "w");
		fclose(fd);

	}
}