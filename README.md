
## install
```
git clone https://github.com/HajimeKonagai/HitohakuAI-Laravel.git
composer install
npm install
```

### initialization

#### Create User
Training data can be created for each user.
After installation, create users using the following command. (*1)
```
php artisan init:create-user {name} {email} {password} {is_admin?}
```
The user ID will be output, so make a note of it.
You will need it when executing the following commands.

#### Create Distionary Data

In addition, dictionary data for plants and addresses will be created.
These are to be used for "training AI on sampling data" and for supplementing the AI when it is in operation, which will be discussed later,
You may skip this step if it is not necessary.

download data
* Plant Dictionary Data (945.8KB)
https://data.hitohaku-ai.jp/plant-dict.csv
* Address dictionary data (10.9MB)
https://data.hitohaku-ai.jp/address-dict.csv

Place the files respectively.
* storage/data/init/plant-dict.csv
* storage/data/init/address-dict.csv

Execute the following command
```
php artisan init:plant-dictionary
php artisan init:address-dictionary
```

#### .env
Since Google Cloud Vision is used for OCR, credentials are required.
https://cloud.google.com/vision/product-search/docs/auth

```
GOOGLE_CLOUD_PROJECT={project name}
GOOGLE_APPLICATION_CREDENTIALS={credentials file location}
```

#### Publishing storage
```
php artisan storage:link
```



### Generating image data to be annotated as training data
Put the sample image data under directory storage/data/original.

The sample data can be found below.

* Specimen image data set (2.88GB) (without endangered species)
https://data.hitohaku-ai.jp/images.zip

Execute the following command
```
php artisan preprocess:create-annotation-from-original {user_id}
```

Make sure that the user_id matches the one output by create-user command(*1).

### OCR
Sample images of the data selected above are subjected to OCR.
Execute OCR on the data that has not been OCR'd yet.
```
php artisan preprocess:execute-ocr
```

### Annotation with tools

Access the server where you installed the application and
Login as the user created in (*1).
Extract (annotate) the data manually using the tool in the "Training Data" section.
Save the data that you have finished extracting as "Done".

### Generate Training Data

Based on the extracted (annotated) data,
Generate teacher data in json format.

Execute the following command
```
php train-data:create {user_id}
```

From the data "Done" in [Annotation with tools], create the trainig data in "storage/app/training-data/annotation.json" The data is generated in the following format.

The teacher data is published as an experimental JSON file.

* Training Data (318.7KB) (without endangered species)
https://data.hitohaku-ai.jp/annotation.zip
* Artificial data (28MB) (without endangered species)
https://data.hitohaku-ai.jp/artificial.json

