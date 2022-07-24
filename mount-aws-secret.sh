
if [ ! mountpoint -q -- /secrets ]
then
  mkdir -p /secrets 
  mount -t tmpfs tmpfs /secrets -o size=5m || exit 1
fi

node $(dirname -- $0)/index $1 $2
