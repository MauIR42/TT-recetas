#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int check_substring(char * text, char * subs);

int main(){
	int a,b,c,d;
	a = check_substring("...txt",".txt");
	b = check_substring("algo aqui",".txt");
	c = check_substring(".tx",".txt");
	d = check_substring(".txt",".txt");
	printf("%s in %s? : %d\n", ".txt","...txt", a);
	printf("%s in %s? : %d\n", ".txt","algo aqui", b);
	printf("%s in %s? : %d\n", ".txt",".tx", c);
	printf("%s in %s? : %d\n", ".txt",".txt", d);
	
}


int check_substring(char * text, char * subs){
	int txt_indx = 0, sub_indx = 0, len_subs = strlen(subs), len_text = strlen(text),found = 0;
	if(len_subs > len_text)
		return 0;
	while( text[txt_indx] != '\0' && !found){
		if(text[txt_indx] == subs[sub_indx]){
			++sub_indx;
		}
		else{
			if(sub_indx > 0 && text[txt_indx] == subs[0])
				sub_indx = 1;
			else
				sub_indx = 0;
		}
		if(sub_indx == len_subs){
			found = 1;
		}
		++txt_indx;
	}
	return found;
}