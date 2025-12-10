export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.message === 'Translation service not available') {
        return res.status(503).json({ 
            success: false,
            error: 'Translation service is currently unavailable',
            message: 'Please try again later'
        });
    }

    if (err.name === 'GoogleGenerativeAIFetchError') {
        return res.status(502).json({
            success: false,
            error: 'AI service error',
            message: 'Unable to process translation at this time'
        });
    }

    return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};
