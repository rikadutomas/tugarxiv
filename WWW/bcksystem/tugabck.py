#!/usr/bin/python3
import os
from datetime import datetime
import re
import numpy as np

##### job variables
path = '/mnt/bckpen/'
maxFolders = 4

##### keep a max of folders (maxFolder value)
fldList = os.listdir(path)
fldList = np.sort(fldList)
print(fldList)
if len(fldList) > maxFolders:
    for x in range(len(fldList)-(maxFolders-1)):
        print(fldList[x])
        os.system('rm -R '+path+fldList[x])

##### name of the folder based on bck + time of creation 
dt = str(datetime.today())
dt = re.sub('\ |\?|\.|\!|\/|\;|\:|\-','',dt)
size = len(dt)
dt = dt[:size - 6]
dr = 'bck' + dt 

###### crearte folder
cmd = 'mkdir '
fld = cmd+path+dr
os.system(fld)
###### run MongoDump
os.system('mongodump --uri="mongodb://admin:7G8aesKe@192.168.0.10:27017/?authSource=admin" --out '+path+dr)
print('... MongoDump Complete')
###### dump Project folder
os.system('cp -r /home/Project/ '+path+dr)
print('...  Copy Project Done')
print('==== Backup Operation Complete ====')
