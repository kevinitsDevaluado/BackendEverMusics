
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors, param, post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';

import multer from 'multer';
import path from 'path';
import {UploadFilesKeys} from '../keys/upload-files-keys';
import {Customer, Image, Product} from '../models';
import {AdvertisingRepository, CustomerRepository, ImageRepository} from '../repositories';

export class FileUploadController {
  constructor() {}
}
