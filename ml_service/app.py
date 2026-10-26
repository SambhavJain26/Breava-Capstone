import os
import tempfile
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from Test_NB_Model import predict_from_csv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for container probes and API gateway."""
    return jsonify({
        "status": "healthy",
        "service": "Breava ML Microservice",
        "model": "GaussianNB (Wisconsin Diagnostic)",
        "features_required": 30
    })


@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    """
    Accepts multipart form-data with a 'file' parameter (CSV).
    Returns JSON: { "results": ["benign", "malignant", ...] }
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided in form-data (key: file).'}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'error': 'Empty filename uploaded.'}), 400

    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as tmp:
        uploaded_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        results = predict_from_csv(tmp_path)
        logger.info(f"Processed {len(results)} diagnostic predictions for {uploaded_file.filename}")
        return jsonify({'results': results})
    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.exception(f"Inference error: {e}")
        return jsonify({'error': f'Model inference failure: {str(e)}'}), 500
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError as err:
                logger.error(f"Failed to delete temporary file {tmp_path}: {err}")


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8008))
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    logger.info(f"Starting Breava ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
