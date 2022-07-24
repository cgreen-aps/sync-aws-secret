
if [ ! -d "/secrets" ]
then
  mkdir /secrets 
  mount -t tmpfs tmpfs /secrets -o size=5m
fi

node index $1 $2
