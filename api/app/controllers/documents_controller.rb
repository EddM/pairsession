# frozen_string_literal: true

class DocumentsController < ApplicationController
  def show
    @document = Document.new(params[:id])

    render json: @document
  end
end
