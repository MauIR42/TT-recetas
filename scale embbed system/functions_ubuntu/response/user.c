#define _XOPEN_SOURCE 500
#include <ftw.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>

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

void set_last( char * new_last){
	FILE *fd = fopen("last.txt", "w");
	fputs(new_last,fd);
	fclose(fd);
}

void add_user(char * user_path){

	// add_at_end("users.txt",user_path);
	create_path(strtok(user_path, ","));

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
    	mkdir(path, 0666);
	}
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
	char aux;
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
		added= 1;
		container[ cont_indx] = '\0';
		// printf("Escribiendo: %s\n", container);
		fd_aux = fopen("aux.txt", "a");
		fputs("\n",fd_aux);
		fputs(container,fd_aux);
		fclose(fd_aux);
	}

	// printf("Sale!\n");
	fclose(fd);
	if(added){
		remove(file);
		// printf("Elimina!\n");
		rename("aux.txt","users.txt");
		// printf("Renombra!\n");
	}else{
		// printf("eliminar datos del archivo\n");
		fd_aux = fopen("users.txt", "w");
		fclose(fd);

	}
}