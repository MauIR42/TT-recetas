#define _XOPEN_SOURCE 500
#include <ftw.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

#include <sys/stat.h>
#include <sys/types.h>

#include "user.h"

char * get_first(char * file){
	FILE * fd;
	char text[16], *to_return;
	fd = fopen(file, "r");
	fgets(text,16,fd);
	printf("%s\n", text);
	to_return = strdup(text);
	fclose(fd);
	return to_return;
}

char * get_until_delimiter(char * file, char delimiter){
	printf("entra a la funcion\n");
	FILE * fd;
	char * result = (char*)malloc(1000 * sizeof(char));
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
	printf("sale de la funcion\n");
	return result;

}

void set_last( char * new_last){
	FILE *fd = fopen("last.txt", "w");
	fputs(new_last,fd);
	fclose(fd);
}

void update_user_pending(char * user, char * pending){
	printf("actualizando pendientes\n");
	char path[30];
	int index = 0, total = strlen(pending);
	sprintf(path,"%s/pendientes.txt", user);
	FILE *fd = fopen(path,"w");
	printf("Agregando datos al usuario: %s\n", user);
	while( index != total ){
		if( pending[ index ] != '#' ){
			printf("%c", pending[ index]);
			fputc(pending[ index ], fd);
		}else{
			fputc('\n', fd);
			printf("\n");
		}
		index++;
	}
	printf("\n");
	fclose(fd);

}

void add_user(char * user_path){
	printf("agregando usuario: %s\n", user_path);
	char new_path[30];
	int i,index = 0;
	printf("agregando a users.txt\n");
	add_at_end("users.txt",user_path);
	for(i = 0; i< strlen(user_path); i++){
		if(user_path[index] == ','){
			new_path[ index ] = '\0';
			break;
		}
		new_path[ index ] = user_path[ index ];
		index++;
	}
	printf("creando carpeta\n");
	create_path(new_path);

	char file[] = "%s/lista.txt";
	char path_complete[30];
	sprintf(path_complete,file,new_path);
	printf("copiando lista\n");
	copy_file("lista.txt",path_complete);

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
	printf("La carpeta a crear es: %s\n", path);
	struct stat st = {0};
	if (stat(path, &st) == -1) {
    	if( 0 != mkdir(path, 0777)){
    		perror("mkdir");
    		exit(1);
    	}
	}
}

int copy_file(char* original, char * copy){
	printf("Original: %s\n", original);
	printf("copia: %s\n", copy);
	int aux;
	FILE *fo, *fc;
	fo = fopen(original, "r");
	if( fo == NULL){
		printf("Error al abrir el archivo: %s\n", original);
		return -1;
	}

	fc = fopen(copy, "w");
	if( fc == NULL){
		printf("Error al abrir el archivo: %s\n", copy);
		return -1;
	}

	aux = fgetc(fo);
	while(aux != EOF){
		printf("%c", aux);
		fputc(aux,fc);
		aux = fgetc(fo);
	}

	fclose(fo);
	fclose(fc);
	return 0;
}


void delete_user(char * user_path){
	int result = nftw(user_path, delete_file, 12, FTW_DEPTH | FTW_PHYS);
	// printf("El resultado de eliminar fue %d\n", result );
	copy_except("users.txt",user_path);

}


int delete_file(const char *f_path, const struct stat *sb, int typeflag, struct FTW *ftwbuf){
	int rf = remove(f_path); //file_path
	if(rf){
		perror("Error al intentar borrar el archivo");
		perror(f_path);
	}
	return rf;
}

void copy_except(char * file,char * except){
	// printf("A eliminar: %s\n", except);
	FILE * fd, * fd_aux;
	int keep = 1, cont_indx = 0, copy = 0, first = 1, added = 0;
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
		if( aux == ',' ){
			container[ cont_indx ] = '\0';
			// printf("a comparar: %s\n", container);
			if(strcmp(except,container) != 0){
				copy = 1;
				container[cont_indx++] = aux;
				continue;
			}else
				cont_indx = 0;
		}
		else if( aux != '\n' && aux != '\0')
			container[cont_indx++] = aux;
		else if( aux == '\n' || aux == '\0' ){
			if(copy){
				copy = 0;
				added= 1;
				fd_aux = fopen("aux.txt", "a");
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
		fd_aux = fopen("aux.txt", "a");
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
		rename("aux.txt",file);
		// printf("Renombra!\n");
	}else{
		// printf("eliminar datos del archivo\n");
		fd_aux = fopen(file, "w");
		fclose(fd);

	}
}