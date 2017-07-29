# frozen_string_literal: true

class DocumentsController < ApplicationController
  def show
    @document = Document.new(name: params[:id])

    respond_to do |format|
      format.html
      format.json { render json: @document }
    end
  end
end
