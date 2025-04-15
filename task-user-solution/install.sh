npm i
if [ "$CI" != true ]; then
  npx prettier . --write
fi