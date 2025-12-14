import os
import tensorflow as tf
import tensorflowjs as tfjs

model_path = "../model/model_weights.h5"
output_path = "../../backend/src/ai/feedforward_model/"

os.makedirs(output_path, exist_ok=True)
model = tf.keras.models.load_model(model_path)
tfjs.converters.save_keras_model(model, output_path)
print(f"✅ Model converted to TensorFlow.js and saved to {output_path}")
