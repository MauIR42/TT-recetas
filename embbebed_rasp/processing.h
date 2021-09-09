#ifndef PROCE_H
#define PROCE_H

int binary_to_int(unsigned char data, int len);
int to_int(unsigned char* data);
int * heap_sort(int * data, int len);
int * heapify(int * data, int len, int c);
int get_averange(int *reads,int len,int to_trim);

#endif