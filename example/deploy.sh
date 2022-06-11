rm -r ./build/
npm run-script build

cd build

git init
git add .
git commit -m "Deploy"

git push -f https://github.com/MateusMP/compute-nodes.git master:gh-pages