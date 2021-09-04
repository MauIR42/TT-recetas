import socket
import sys 
# Creación de un socket TCP (stream) 

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Como ejemplo se usará el puerto 10000
dir_server = ("192.168.100.41", 10003)
print('Inicializando servidor {} en el puerto {}'.format(*dir_server))

sock.bind(dir_server)
sock.listen(1)
print(sock.getsockname())
while True:
    # Esperamos una conexión
    print('Esperando conexión...')
    conexion, dir_cliente = sock.accept()

    try:
        print('Conexión acpetada del cliente', dir_cliente)
        query = conexion.recv(15).decode("utf8")
        print(query, '!!!!')
    finally:
        # Cerrar la conexión
        conexion.close()
