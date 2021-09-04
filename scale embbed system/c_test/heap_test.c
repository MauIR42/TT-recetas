#include <stdio.h>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

int * heap_sort(int * data, int len);
int * heapify(int * data, int len, int c);
void print_array(int* data, int len);

int main(){
	int * data = (int *)calloc(10, sizeof(int)), indx;
	srand(time(0));
	for(indx = 0; indx < 10; indx ++){
		data[indx] = rand() % (101);
	}
	print_array(data,10);
	printf("\n");
	data = heap_sort(&data[0], 10);
	print_array(data,10);

}
int * heap_sort(int * data, int len){
	int start = len/2 - 1, indx;
	int temp;
	for(indx = start; indx >= 0; indx --){
		data = heapify(data,len, indx);
	}
	for(indx = len -1; indx >= 0; indx--){
		temp = data[indx];
		data[indx] = data [0];
		data[0] = temp;
		data = heapify(data,indx, 0);
	}
	return &data[0];
}

int * heapify(int * data, int len, int c){
	int largest = c, l = c * 2 + 1, r = c * 2 + 2;
	int temp;
	if( l <= (len - 1) && data[largest] < data[l])
		largest = l;
	if( r <= (len - 1) && data[largest] < data[r] )
		largest = r;
	if(largest != c){
		temp = data[c];
		data[c] = data[largest];
		data[largest] = temp;
		return heapify(data, len, largest);
	}
	return data;
}

void print_array(int * data, int len){
	int indx;
	for(indx = 0; indx < len; indx ++ ){
		printf("%d ", data[indx]);
	}
	printf("\n");
}